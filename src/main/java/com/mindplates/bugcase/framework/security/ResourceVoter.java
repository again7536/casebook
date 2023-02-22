package com.mindplates.bugcase.framework.security;

import com.mindplates.bugcase.biz.project.service.ProjectService;
import com.mindplates.bugcase.biz.space.service.SpaceService;
import com.mindplates.bugcase.common.code.SystemRole;
import com.mindplates.bugcase.common.vo.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.expression.WebExpressionVoter;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RequiredArgsConstructor
public class ResourceVoter extends WebExpressionVoter {

    public static final Pattern USERS_PATTERN = Pattern.compile("^/api/users/my/?(.*)?$");
    public static final Pattern PROJECTS_PATTERN = Pattern.compile("^/api/(.*)/projects/?(.*)");
    public static final Pattern SPACES_PATTERN = Pattern.compile("^/api/spaces/?(.*)?");
    public static final Pattern ADMIN_PATTERN = Pattern.compile("^/api/admin/?(.*)?");
    private final SpaceService spaceService;

    private final ProjectService projectService;
    List<Pattern> allPassPatterns = Arrays.asList(Pattern.compile("^/api/spaces/(.*)/accessible$"), Pattern.compile("^/api/spaces/(.*)/applicants$"), Pattern.compile("^/api/spaces/(.*)/users/my$"));

    @Override
    public boolean supports(ConfigAttribute attribute) {
        return true;
    }

    @Override
    public boolean supports(Class clazz) {
        return true;
    }

    @Override
    public int vote(Authentication authentication, FilterInvocation fi, Collection<ConfigAttribute> attributes) {

        if (authentication instanceof UsernamePasswordAuthenticationToken) {
            SecurityUser user = (SecurityUser) authentication.getPrincipal();
            Long userId = user.getId();

            HttpServletRequest request = fi.getRequest();

            boolean allPass = allPassPatterns.stream().anyMatch((pattern) -> pattern.matcher(request.getRequestURI()).matches());
            if (allPass) {
                return ACCESS_GRANTED;
            }

            Matcher usersMatcher = USERS_PATTERN.matcher(request.getRequestURI());
            Matcher spacesMatcher = SPACES_PATTERN.matcher(request.getRequestURI());
            Matcher projectsMatcher = PROJECTS_PATTERN.matcher(request.getRequestURI());
            Matcher adminMatcher = ADMIN_PATTERN.matcher(request.getRequestURI());
            if (adminMatcher.matches()) {
                return SystemRole.ROLE_ADMIN.toString().equals(user.getRoles()) ? ACCESS_GRANTED : ACCESS_DENIED;
            } else if (usersMatcher.matches()) {
                return ACCESS_GRANTED;
            } else if (projectsMatcher.matches()) {

                if (SystemRole.ROLE_ADMIN.toString().equals(user.getRoles())) {
                    return ACCESS_GRANTED;
                }

                String spaceCode = projectsMatcher.group(1);
                String projectIdInfo = projectsMatcher.group(2);

                // 스페이스 권한 없으면 거부
                if (!(StringUtils.isNotBlank(spaceCode) && spaceService.selectIsSpaceMember(spaceCode, userId))) {
                    return ACCESS_DENIED;
                }

                HttpMethod method = HttpMethod.valueOf(request.getMethod());

                if (method == HttpMethod.PUT || method == HttpMethod.DELETE) {
                    Long projectId;
                    try {
                        projectId = Long.parseLong(projectIdInfo);
                    } catch (Exception e) {
                        return ACCESS_DENIED;
                    }

                    // 프로젝트 수정, 삭제는 프로젝트 어드민인 경우, 허용
                    if (projectService.selectIsProjectAdmin(projectId, userId)) {
                        return ACCESS_GRANTED;
                    }

                    return ACCESS_DENIED;

                } else if (method == HttpMethod.POST) {
                    // 프로젝트 생성은 스페이스 멤버인 경우 모두 허용
                    return ACCESS_GRANTED;
                } else {

                    // 프로젝트 목록인 경우, 허용
                    if ("".equals(projectIdInfo) || "my".equals(projectIdInfo)) {
                        return ACCESS_GRANTED;
                    }

                    Long projectId;
                    try {
                        projectId = Long.parseLong(projectIdInfo);
                    } catch (Exception e) {
                        return ACCESS_DENIED;
                    }

                    // 특정 프로젝트 접근은 멤버인 경우 허용
                    if (projectService.selectIsProjectMember(projectId, userId)) {
                        return ACCESS_GRANTED;
                    }

                    return ACCESS_DENIED;
                }
            } else if (spacesMatcher.matches()) {
                if (SystemRole.ROLE_ADMIN.toString().equals(user.getRoles())) {
                    return ACCESS_GRANTED;
                }

                HttpMethod method = HttpMethod.valueOf(request.getMethod());

                if (method == HttpMethod.PUT || method == HttpMethod.DELETE) {
                    String spaceInfo = spacesMatcher.group(1);

                    if (spaceInfo.indexOf('/') > -1) {
                        String[] values = spaceInfo.split("/");
                        if (values.length > 0) {
                            spaceInfo = values[0];
                        }
                    }

                    boolean isNumber = NumberUtils.isCreatable(spaceInfo);
                    boolean isAdmin = false;
                    if (isNumber) {
                        isAdmin = spaceService.selectIsSpaceAdmin(Long.parseLong(spaceInfo), userId);
                    } else {
                        isAdmin = spaceService.selectIsSpaceAdmin(spaceInfo, userId);
                    }

                    if (isAdmin) {
                        return ACCESS_GRANTED;
                    }
                    return ACCESS_DENIED;
                } else if (method == HttpMethod.POST) {
                    return ACCESS_GRANTED;
                } else {
                    String spaceInfo = spacesMatcher.group(1);

                    if (spaceInfo.indexOf('/') > -1) {
                        String[] values = spaceInfo.split("/");
                        if (values.length > 0) {
                            spaceInfo = values[0];
                        }
                    }

                    if (!StringUtils.isBlank(spaceInfo) && !"my".equals(spaceInfo)) {
                        boolean isUser = spaceService.selectIsSpaceMember(spaceInfo, userId);
                        if (isUser) {
                            return ACCESS_GRANTED;
                        } else {
                            return ACCESS_DENIED;
                        }
                    }
                    return ACCESS_GRANTED;
                }

            }

        }

        return ACCESS_DENIED;


    }


}
