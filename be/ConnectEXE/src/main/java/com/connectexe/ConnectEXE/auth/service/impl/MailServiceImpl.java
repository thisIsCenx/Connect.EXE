package com.connectexe.ConnectEXE.auth.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.connectexe.ConnectEXE.auth.service.MailService;

/**
 * Implementation for handling mail operations.
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a verification email to the user.
     *
     * @param toEmail the recipient email address
     * @param verificationCode the verification code
     * @param type the type of email (forgot password/register)
     */
    @Override
    public void sendVerificationEmail(String toEmail, String verificationCode, String type) {
        try {
            String subject;
            String messageTitle;
            String messageNote;

            if ("forgot".equalsIgnoreCase(type)) {
                subject = "Reset Your Password - Connect.EXE";
                messageTitle = "Password Reset Request";
                messageNote = "Use this code to reset your password.";
            } else {
                subject = "Verify Your Connect.EXE Account";
                messageTitle = "Welcome to Connect.EXE!";
                messageNote = "Please enter this code to activate your account.";
            }

            String htmlContent = "<div style='font-family:Arial,sans-serif; text-align:center;'>"
                    + "<h2 style='color:#b71c1c;'>" + messageTitle + "</h2>"
                    + "<p><strong>Your verification code is:</strong></p>"
                    + "<div style='padding:10px; background:#f8f8f8; display:inline-block; border-radius:8px;'>"
                    + "<h3 style='color:#e53935;'>" + verificationCode + "</h3></div>"
                    + "<p>" + messageNote + "</p>"
                    + "<p style='color:gray; font-size:0.9em;'>If you did not request this, please ignore.</p>"
                    + "<hr/><p style='font-size:0.8em;'>MovieTheater Team</p>"
                    + "</div>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(toEmail);
            // Set From to the authenticated mailbox to satisfy SMTP servers like Gmail
            if (fromEmail != null && !fromEmail.isBlank()) {
                helper.setFrom(fromEmail);
            }
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Sending mail can throw unchecked MailException when SMTP is not configured.
            // We swallow it in dev to avoid failing the primary flow.
            mailSender.send(message);
            log.info("Email sent to {} with type {}", toEmail, type);
        } catch (Exception e) {
            // Catch any mail-related errors (MessagingException, MailException, etc.)
            log.warn("Non-fatal: failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
