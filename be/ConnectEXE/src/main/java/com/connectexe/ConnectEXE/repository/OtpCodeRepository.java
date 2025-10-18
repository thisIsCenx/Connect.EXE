package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, String> {
	Optional<OtpCode> findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(String userId, String otpType);

	long countByUserIdAndOtpTypeAndCreatedAtAfter(String userId, String otpType, LocalDateTime after);

	Optional<OtpCode> findTopByUserIdAndOtpTypeAndIsUsedTrueOrderByCreatedAtDesc(String userId, String otpType);
}
