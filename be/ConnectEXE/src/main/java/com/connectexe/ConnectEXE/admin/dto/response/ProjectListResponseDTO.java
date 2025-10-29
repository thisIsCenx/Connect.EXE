package com.connectexe.ConnectEXE.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectListResponseDTO {
    private List<AdminProjectDTO> projects;
    private Integer totalPages;
    private Integer currentPage;
    private Long totalItems;
}
