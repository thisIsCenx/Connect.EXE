package com.connectexe.ConnectEXE.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
// AntPathRequestMatcher resolved via fully-qualified name in filterChain to avoid import issues
import org.springframework.web.filter.OncePerRequestFilter;
import com.connectexe.ConnectEXE.auth.service.CustomOAuth2UserService;
import com.connectexe.ConnectEXE.auth.service.CustomUserDetailsService;
import com.connectexe.ConnectEXE.common.constant.RouteConst;
import com.connectexe.ConnectEXE.security.JwtAuthenticationFilter;

import java.io.IOException;
import java.util.List;

/**
 * Configuration class for Spring Security settings in the movie theater application.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          CustomOAuth2UserService customOAuth2UserService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Provides a BCrypt password encoder bean for password encryption.
     *
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the authentication provider using the user details service and password encoder.
     *
     * @return DaoAuthenticationProvider instance
     */
                @Bean
                public org.springframework.security.authentication.AuthenticationProvider authenticationProvider() {
                        return new org.springframework.security.authentication.AuthenticationProvider() {
                                @Override
                                public org.springframework.security.core.Authentication authenticate(org.springframework.security.core.Authentication authentication) throws org.springframework.security.core.AuthenticationException {
                                        String username = authentication.getName();
                                        String rawPassword = authentication.getCredentials() == null ? null : authentication.getCredentials().toString();
                                        org.springframework.security.core.userdetails.UserDetails userDetails = ((UserDetailsService) userDetailsService).loadUserByUsername(username);
                                        if (userDetails == null) {
                                                throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
                                        }
                                        if (!passwordEncoder().matches(rawPassword, userDetails.getPassword())) {
                                                throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
                                        }
                                        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                }

                                @Override
                                public boolean supports(Class<?> authentication) {
                                        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
                                }
                        };
                }

    /**
     * Provides the authentication manager bean.
     *
     * @param config the authentication configuration
     * @return AuthenticationManager instance
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Custom filter to authenticate users based on role cookies.
     * Runs first for backwards compatibility, JWT filter will override if present.
     *
     * @return OncePerRequestFilter instance
     */
    @Bean
    public OncePerRequestFilter cookieAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest req,
                    HttpServletResponse res,
                    FilterChain chain) throws ServletException, IOException {
                
                Cookie[] cookies = req.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("role".equals(cookie.getName())) {
                            String role = cookie.getValue();
                            if (role != null && !role.isEmpty()) {
                                String principal = "cookieUser_" + role.toLowerCase();
                                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                        principal, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                System.out.println("🍪 Cookie auth set for role: " + role + " (may be overridden by JWT)");
                                break;
                            }
                        }
                    }
                }
                chain.doFilter(req, res);
            }
        };
    }

    /**
     * Configures the security filter chain for HTTP requests.
     *
     * @param http the HttpSecurity object to configure
     * @return SecurityFilterChain instance
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authenticationProvider(authenticationProvider())
                // Cookie filter runs first (for backwards compatibility)
                .addFilterBefore(cookieAuthFilter(), org.springframework.security.web.context.SecurityContextHolderFilter.class)
                // JWT filter runs AFTER SecurityContextHolder and OVERRIDES cookie auth if JWT present
                .addFilterAfter(jwtAuthenticationFilter, org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // Public endpoints
            // Public auth endpoints (login/register/otp/password) should be accessible without auth
            // Explicit public POST endpoints to avoid any matcher ambiguity
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.REGISTER).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.REGISTER_VERIFY).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.REGISTER_RESEND).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.LOGIN).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.LOGOUT).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.PASSWORD_FORGOT).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.PASSWORD_VERIFY).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.AUTH_BASE + RouteConst.PASSWORD_RESET).permitAll()
            .requestMatchers(HttpMethod.POST, RouteConst.OTP_BASE + "/**").permitAll()
            // OAuth2 success page (optional public)
            .requestMatchers(HttpMethod.GET, RouteConst.OAUTH2_SUCCESS).permitAll()
                        // Public read endpoints for the platform
                        .requestMatchers(HttpMethod.GET, RouteConst.PROJECTS, RouteConst.PROJECTS + "/**").permitAll()
                        // New Project API endpoints
                        .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/projects").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/projects/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/projects/*/vote").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/projects/*/vote").authenticated()
                        .requestMatchers(HttpMethod.GET, RouteConst.SKILLS).permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.MATERIALS + "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.NEWS + "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.FORUM_TOPICS, RouteConst.FORUM_TOPIC_ID_PATH).permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.USERS_ID_PATH).permitAll()
                        // User profile endpoints
                        .requestMatchers(HttpMethod.GET, RouteConst.USERS_ME).authenticated()
                        .requestMatchers(HttpMethod.PATCH, RouteConst.USERS_ME).authenticated()
                        .requestMatchers(HttpMethod.PATCH, RouteConst.USERS_ME + "/skills").authenticated()
                        // Projects and related modifications
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECTS).authenticated()
                        .requestMatchers(HttpMethod.PATCH, RouteConst.PROJECTS_ID_PATH).authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.PROJECTS_ID_PATH).authenticated()
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECTS_ID_PATH + "/members").authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.PROJECTS_ID_PATH + "/members/" + "**").authenticated()
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECTS_ID_PATH + "/images").authenticated()
                        .requestMatchers(HttpMethod.PATCH, RouteConst.PROJECT_IMAGE_ID_PATH).authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.PROJECT_IMAGE_ID_PATH).authenticated()
                        .requestMatchers(HttpMethod.GET, RouteConst.PROJECT_REPORTS + "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECTS_ID_PATH + "/reports").authenticated()
                        .requestMatchers(HttpMethod.GET, RouteConst.PROJECT_COMMENTS).permitAll()
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECT_COMMENTS).authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.PROJECT_COMMENTS + "/" + "**").authenticated()
                        .requestMatchers(HttpMethod.POST, RouteConst.PROJECT_VOTES).authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.PROJECT_VOTES).authenticated()
                        // Support tickets
                        .requestMatchers(HttpMethod.POST, RouteConst.SUPPORT_TICKETS).authenticated()
                        .requestMatchers(HttpMethod.GET, RouteConst.SUPPORT_TICKETS).authenticated()
                        .requestMatchers(HttpMethod.PATCH, RouteConst.SUPPORT_TICKET_ID_PATH).hasAnyRole("ADMIN", "STAFF")
                        // Forum moderation
                        .requestMatchers(HttpMethod.PATCH, RouteConst.FORUM_APPROVE).hasAnyRole("TEACHER", "ADMIN")
                        // Everything else requires authentication
                        .anyRequest().authenticated())
                .formLogin(form -> form.disable())
                .oauth2Login(oauth -> oauth
                        .loginPage("/oauth2/authorization/google")
                        .defaultSuccessUrl(RouteConst.OAUTH2_SUCCESS, true)
                        .userInfoEndpoint(user -> user.userService(customOAuth2UserService)))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpStatus.UNAUTHORIZED.value());
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        }));

        return http.build();
    }
}