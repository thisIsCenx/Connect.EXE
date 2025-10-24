package com.connectexe.ConnectEXE.util;

import java.security.SecureRandom;

/**
 * Utility for generating simple hex IDs compatible with database defaults.
 * Generates lowercase hex strings of requested length.
 */
public final class IdUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final char[] HEX = "0123456789abcdef".toCharArray();

    private IdUtil() {}

    public static String randomHex(int length) {
        byte[] bytes = new byte[(length + 1) / 2];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder(length);
        for (byte b : bytes) {
            sb.append(HEX[(b >> 4) & 0xF]);
            sb.append(HEX[b & 0xF]);
        }
        return sb.substring(0, length);
    }
}
