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
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
// AntPathRequestMatcher resolved via fully-qualified name in filterChain to avoid import issues
import org.springframework.web.filter.OncePerRequestFilter;
import com.connectexe.ConnectEXE.auth.service.CustomOAuth2UserService;
import com.connectexe.ConnectEXE.auth.service.CustomUserDetailsService;
import com.connectexe.ConnectEXE.common.constant.RouteConst;

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

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          CustomOAuth2UserService customOAuth2UserService) {
        this.userDetailsService = userDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
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
                // use SecurityContextHolderFilter (replacement for deprecated SecurityContextPersistenceFilter)
                .addFilterBefore(cookieAuthFilter(), org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/locations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/theaters").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/theaters/location/**").permitAll()
                        .requestMatchers(RouteConst.IMAGES + "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.ADMIN_BASE + RouteConst.MOVIE,
                                RouteConst.ADMIN_BASE + RouteConst.MOVIE_SEARCH).permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.ADMIN_BASE + RouteConst.SHOWTIME + "/**",
                                RouteConst.ADMIN_BASE + RouteConst.ROOM).permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.ADMIN_BASE + RouteConst.TICKETS).permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui/**", "/webjars/**").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.ADMIN_BASE + RouteConst.PROMOTION + "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.BOOK_BASE + RouteConst.MOVIE,
                                RouteConst.BOOK_BASE + RouteConst.MOVIE + RouteConst.API_PARAM_ID_PATH,
                                RouteConst.BOOK_BASE + RouteConst.SCHEDULE + RouteConst.API_PARAM_ID_PATH,
                                RouteConst.BOOK_BASE + RouteConst.SCHEDULE + "/id" + RouteConst.API_PARAM_SCHEDULE_ID_PATH,
                                RouteConst.BOOK_BASE + RouteConst.SEAT + RouteConst.API_PARAM_SCHEDULE_ID_PATH).permitAll()
                        .requestMatchers(RouteConst.AUTH_BASE + RouteConst.LOGIN, "/login", "/oauth2/**",
                                RouteConst.AUTH_BASE + RouteConst.REGISTER + "/**",
                                RouteConst.AUTH_BASE + RouteConst.PASSWORD + "/**", "/error", "/api/test").permitAll()
                        .requestMatchers(RouteConst.THEATERS).permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.SCHEDULES_THEATER + "/**").permitAll()
                        .requestMatchers(RouteConst.ADMIN_BASE + RouteConst.EMPLOYEES + "/**").permitAll()
                        .requestMatchers(RouteConst.ADMIN_BASE + RouteConst.CONCESSION + "/**").permitAll()
                        .requestMatchers(RouteConst.ADMIN_BASE + RouteConst.PROMOTION + "/**").permitAll()
                        .requestMatchers(RouteConst.SCORES + "/**").permitAll()
                        .requestMatchers("/api/admin/statistics").permitAll()
                        .requestMatchers(HttpMethod.GET, RouteConst.ADMIN_BASE + "/movie/top-booked").permitAll()
                        .requestMatchers("/api/admin/statistics/revenue/**").permitAll()
                        // Role-based access
                        .requestMatchers(HttpMethod.POST, RouteConst.ADMIN_BASE + RouteConst.MOVIE,
                                RouteConst.ADMIN_BASE + RouteConst.SHOWTIME).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, RouteConst.ADMIN_BASE + RouteConst.MOVIE + "/**",
                                RouteConst.ADMIN_BASE + RouteConst.SHOWTIME + "/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, RouteConst.ADMIN_BASE + RouteConst.MOVIE + "/**",
                                RouteConst.ADMIN_BASE + RouteConst.SHOWTIME + "/**").hasRole("ADMIN")
                        .requestMatchers(RouteConst.ADMIN_BASE + "/**").hasRole("ADMIN")
                        .requestMatchers(RouteConst.EMPLOYEE_BASE + "/**").hasRole("EMPLOYEE")
                        .requestMatchers(HttpMethod.GET, RouteConst.BOOK_BASE + RouteConst.BOOKINGS + "/user",
                                RouteConst.BOOK_BASE + RouteConst.BOOKINGS + RouteConst.API_PARAM_ID_PATH).authenticated()
                        .requestMatchers(HttpMethod.POST, RouteConst.BOOK_BASE + RouteConst.CONFIRM).authenticated()
                        .requestMatchers(HttpMethod.DELETE, RouteConst.BOOK_BASE + RouteConst.BOOKINGS + RouteConst.API_PARAM_ID_PATH).authenticated()
                        // Others
                        .anyRequest().authenticated())
                .formLogin(form -> form.disable())
                .oauth2Login(oauth -> oauth
                        .loginPage("/oauth2/authorization/google")
                        .defaultSuccessUrl(RouteConst.OAUTH2_SUCCESS, true)
                        .userInfoEndpoint(user -> user.userService(customOAuth2UserService)))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/api/"))
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpStatus.UNAUTHORIZED.value());
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        }));

        return http.build();
    }
}