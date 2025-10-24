package com.connectexe.ConnectEXE.repository;

import com.connectexe.ConnectEXE.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    /**
     * Find users by a list of roles with pagination.
     * @param roles List of roles
     * @param pageable Pageable object
     * @return Page of users
     */
    Page<User> findByRoleIn(List<String> roles, Pageable pageable);
    /**
     * Check if a user exists by email.
     * @param email Email address
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);
    /**
     * Check if a user exists by phone number.
     * @param phoneNumber Phone number
     * @return true if exists, false otherwise
     */
    @Query("select case when count(u)>0 then true else false end from User u where u.phone = :phone")
    boolean existsByPhoneNumber(@Param("phone") String phoneNumber);
    /**
     * Find a user by email.
     * @param email Email address
     * @return Optional of User
     */
    Optional<User> findByEmail(String email);
    /**
     * Find a user by phone number.
     * @param phoneNumber Phone number
     * @return Optional of User
     */
    @Query("select u from User u where u.phone = :phone")
    Optional<User> findByPhoneNumber(@Param("phone") String phoneNumber);
    /**
     * Find a user by email or phone number.
     * @param email Email address
     * @param phoneNumber Phone number
     * @return Optional of User
     */
    @Query("select u from User u where u.email = :email or u.phone = :phone")
    Optional<User> findByEmailOrPhoneNumber(@Param("email") String email, @Param("phone") String phoneNumber);
    /**
     * Find the most recent user by email.
     * @param email Email address
     * @return Optional of User
     */
    @Query("select u from User u where u.email = :email order by u.createdAt desc")
    Optional<User> findTopByEmailOrderByIdDesc(@Param("email") String email);
    /**
     * Find a user by email (case-insensitive).
     * @param email Email address
     * @return Optional of User
     */
    Optional<User> findByEmailIgnoreCase(String email);
    /**
     * Check if a user exists by identity card.
     * @param identityCard Identity card number
     * @return true if exists, false otherwise
     */
    @Query("select case when count(u)>0 then true else false end from User u where u.identityNumber = :identity")
    boolean existsByIdentityCard(@Param("identity") String identityCard);
    /**
     * Find a user by identity card.
     * @param identityCard Identity card number
     * @return Optional of User
     */
    @Query("select u from User u where u.identityNumber = :identity")
    Optional<User> findByIdentityCard(@Param("identity") String identityCard);
    /**
     * Count the total number of users.
     * @return total user count
     */
    long count();
}