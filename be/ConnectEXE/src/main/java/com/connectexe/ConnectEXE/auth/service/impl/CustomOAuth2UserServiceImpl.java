package com.connectexe.ConnectEXE.auth.service.impl;

import com.connectexe.ConnectEXE.auth.service.CustomOAuth2UserService;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.util.IdUtil; // Import lớp tiện ích tạo ID
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserServiceImpl extends DefaultOAuth2UserService implements CustomOAuth2UserService {

    private final UserRepository userRepository;
    // Sử dụng BCrypt để mã hóa mật khẩu ngẫu nhiên, đảm bảo an toàn
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        processOAuth2User(oAuth2User); // Xử lý logic tìm hoặc tạo user
        return oAuth2User;
    }

    /**
     * Xử lý thông tin người dùng từ Google, đối chiếu với cấu trúc của entity User.java.
     * - Nếu người dùng tồn tại: Đăng nhập và cập nhật trạng thái.
     * - Nếu chưa tồn tại: Tạo người dùng mới với logic tương tự RegisterServiceImpl.
     */
    @Override
    @Transactional
    public User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email not found from Google OAuth2 provider.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            // --- TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ TỒN TẠI ---
            User existingUser = userOptional.get();
            log.info("✅ Existing user '{}' logged in via Google.", email);
            
            // Đảm bảo tài khoản luôn được kích hoạt khi đăng nhập qua Google
            existingUser.setIsActive(true);
            existingUser.setIsVerified(true);
            return userRepository.save(existingUser);
        } else {
            // --- TRƯỜNG HỢP 2: TẠO NGƯỜI DÙNG MỚI (Logic tương tự RegisterServiceImpl) ---
            log.info("✨ New user via Google. Creating account for '{}'.", email);
            
            User newUser = new User();
            String fullName = oAuth2User.getAttribute("name");

            // 1. Tạo userId ngẫu nhiên, giống hệt RegisterServiceImpl
            newUser.setUserId(IdUtil.randomHex(12));

            // 2. Thiết lập thông tin lấy được từ Google
            newUser.setFullName(fullName);
            newUser.setEmail(email);

            // 3. Xử lý trường `password` bắt buộc (nullable=false)
            // Tạo một mật khẩu ngẫu nhiên, không thể sử dụng để đăng nhập thường
            String randomPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(randomPassword));
            
            // 4. Các trường khác không có thông tin từ Google sẽ để là null
            // (phone, identityNumber, major)
            
            // 5. Thiết lập vai trò và trạng thái mặc định
            newUser.setRole("student"); // Vai trò mặc định là STUDENT
            newUser.setIsActive(true);      // Kích hoạt tài khoản
            newUser.setIsVerified(true);    // Email đã được Google xác thực
            newUser.setCreatedAt(LocalDateTime.now());

            return userRepository.save(newUser);
        }
    }
}