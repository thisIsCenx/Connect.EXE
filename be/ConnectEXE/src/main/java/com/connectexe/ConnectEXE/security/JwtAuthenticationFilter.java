package com.connectexe.ConnectEXE.security;

import com.connectexe.ConnectEXE.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                String userId = jwtTokenProvider.getUserIdFromToken(jwt);
                String role = jwtTokenProvider.getRoleFromToken(jwt);
                
                // CLEAR any existing authentication (from cookie filter)
                SecurityContextHolder.clearContext();
                
                // Create authentication with role authority
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(authority));
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set JWT authentication in SecurityContext (overrides cookie auth)
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                System.out.println("✅ JWT authenticated user: " + userId + " with role: " + role + " (overriding any previous auth)");
            } else if (jwt != null) {
                System.err.println("❌ Invalid JWT token");
            }
        } catch (Exception ex) {
            System.err.println("❌ Could not set user authentication in security context: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}
