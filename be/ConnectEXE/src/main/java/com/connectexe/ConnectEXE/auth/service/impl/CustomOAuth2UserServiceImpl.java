package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.service.CustomOAuth2UserService;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation for handling OAuth2 user service operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserServiceImpl implements CustomOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        processOAuth2User(oAuth2User);
        return oAuth2User;
    }

    @Override
    @Transactional
    public User processOAuth2User(OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new RuntimeException("Google login failed. Please try again.");
        }
        String email = oAuth2User.getAttribute("email");
    String fullName = oAuth2User.getAttribute("name");

        return userRepository.findByEmail(email).map(user -> {
            boolean changed = false;
            if (!Boolean.TRUE.equals(user.getIsVerified())) {
                user.setIsVerified(true);
                changed = true;
            }
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                user.setIsActive(true);
                changed = true;
            }
            if (changed) {
                return userRepository.save(user);
            }
            return user;
        }).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setRole("USER");
            newUser.setIsActive(true);
            newUser.setIsVerified(true);
            return userRepository.save(newUser);
        });
    }
}
