package com.connectexe.ConnectEXE.project.service.impl;

import com.connectexe.ConnectEXE.entity.Project;
import com.connectexe.ConnectEXE.entity.User;
import com.connectexe.ConnectEXE.entity.Vote;
import com.connectexe.ConnectEXE.project.dto.request.CreateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.request.UpdateProjectRequest;
import com.connectexe.ConnectEXE.project.dto.response.ProjectResponse;
import com.connectexe.ConnectEXE.project.service.ProjectService;
import com.connectexe.ConnectEXE.repository.ProjectRepository;
import com.connectexe.ConnectEXE.repository.UserRepository;
import com.connectexe.ConnectEXE.repository.VoteRepository;
import com.connectexe.ConnectEXE.util.IdUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    @Override
    public List<ProjectResponse> getRandomProjectsFromSubscriptions(String userId, int limit) {
        List<Project> projects = projectRepository.findRandomProjectsFromSubscriptions(userId, limit);
        return projects.stream()
                .map(project -> convertToProjectResponse(project, userId))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProjectResponse> getSuccessfulProjects(int page, int size, String userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Project> projects = projectRepository.findByStatusAndIsPublic(
                Project.ProjectStatus.SUCCESSFUL, true, pageable);
        return projects.map(project -> convertToProjectResponse(project, userId));
    }

    @Override
    public Page<ProjectResponse> getAllProjects(int page, int size, String userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Project> projects = projectRepository.findByIsPublic(true, pageable);
        return projects.map(project -> convertToProjectResponse(project, userId));
    }

    @Override
    public Page<ProjectResponse> getProjectsByCategory(Project.ProjectCategory category, int page, int size, String userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Project> projects = projectRepository.findByCategoryAndIsPublic(category, true, pageable);
        return projects.map(project -> convertToProjectResponse(project, userId));
    }

    @Override
    public ProjectResponse getProjectDetail(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return convertToProjectResponse(project, userId);
    }

    @Override
    public Page<ProjectResponse> getVotingProjects(int page, int size, String userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> projectsWithVotes = projectRepository.findProjectsWithVoteCounts(pageable);
        
        return projectsWithVotes.map(result -> {
            Project project = (Project) result[0];
            Long voteCount = (Long) result[1];
            
            ProjectResponse response = convertToProjectResponse(project, userId);
            response.setVoteCount(voteCount);
            return response;
        });
    }

    @Override
    public ProjectResponse createProject(CreateProjectRequest request, String userId) {
        Project project = new Project();
        project.setProjectId(IdUtil.randomHex(12));
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setContent(request.getContent());
        project.setCategory(request.getCategory() != null ? request.getCategory() : Project.ProjectCategory.OTHER);
        project.setStatus(Project.ProjectStatus.PENDING);
        project.setImageUrl(request.getImageUrl());
        project.setTags(request.getTags());
        project.setMembers(request.getMembers());
        project.setWebsiteLink(request.getWebsiteLink());
        project.setGithubLink(request.getGithubLink());
        project.setDemoLink(request.getDemoLink());
        project.setOwnerId(userId);
        project.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);
        return convertToProjectResponse(savedProject, userId);
    }

    @Override
    public ProjectResponse updateProject(String projectId, UpdateProjectRequest request, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this project");
        }

        if (request.getProjectName() != null) {
            project.setProjectName(request.getProjectName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getContent() != null) {
            project.setContent(request.getContent());
        }
        if (request.getCategory() != null) {
            project.setCategory(request.getCategory());
        }
        if (request.getImageUrl() != null) {
            project.setImageUrl(request.getImageUrl());
        }
        if (request.getTags() != null) {
            project.setTags(request.getTags());
        }
        if (request.getMembers() != null) {
            project.setMembers(request.getMembers());
        }
        if (request.getWebsiteLink() != null) {
            project.setWebsiteLink(request.getWebsiteLink());
        }
        if (request.getGithubLink() != null) {
            project.setGithubLink(request.getGithubLink());
        }
        if (request.getDemoLink() != null) {
            project.setDemoLink(request.getDemoLink());
        }
        if (request.getIsPublic() != null) {
            project.setIsPublic(request.getIsPublic());
        }

        project.setUpdatedAt(LocalDateTime.now());
        Project updatedProject = projectRepository.save(project);
        return convertToProjectResponse(updatedProject, userId);
    }

    @Override
    public void voteProject(String projectId, String userId) {
        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException("Project not found");
        }

        // Check if already voted
        if (voteRepository.existsByUserIdAndProjectId(userId, projectId)) {
            return; // Already voted, do nothing
        }

        Vote vote = new Vote();
        vote.setVoteId(IdUtil.randomHex(12));
        vote.setUserId(userId);
        vote.setProjectId(projectId);
        vote.setIsUpvote(true);
        voteRepository.save(vote);
    }

    @Override
    public void unvoteProject(String projectId, String userId) {
        voteRepository.deleteByUserIdAndProjectId(userId, projectId);
    }

    private ProjectResponse convertToProjectResponse(Project project, String userId) {
        // Get author name
        String authorName = userRepository.findById(project.getOwnerId())
                .map(User::getFullName)
                .orElse("Unknown");

        // Get vote count
        long voteCount = voteRepository.countUpvotesByProjectId(project.getProjectId());

        // Check if current user has voted
        boolean hasVoted = userId != null && 
                voteRepository.existsByUserIdAndProjectId(userId, project.getProjectId());

        return ProjectResponse.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectName())
                .description(project.getDescription())
                .content(project.getContent())
                .category(project.getCategory())
                .status(project.getStatus())
                .imageUrl(project.getImageUrl())
                .tags(project.getTags())
                .members(project.getMembers())
                .websiteLink(project.getWebsiteLink())
                .githubLink(project.getGithubLink())
                .demoLink(project.getDemoLink())
                .ownerId(project.getOwnerId())
                .authorName(authorName)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .isPublic(project.getIsPublic())
                .voteCount(voteCount)
                .hasVoted(hasVoted)
                .build();
    }
}
