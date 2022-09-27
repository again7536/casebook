package com.mindplates.bugcase.biz.space.vo.request;

import com.mindplates.bugcase.biz.space.entity.Space;
import com.mindplates.bugcase.biz.space.entity.SpaceUser;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SpaceRequest {

    MultipartFile file;
    private Long id;
    @NotNull
    @Size(min = 1)
    private String name;
    private String code;
    private String description;
    private Boolean activated;
    private String token;
    private List<SpaceUserRequest> users;

    public Space buildEntity() {

        Space space = Space.builder()
                .id(id)
                .name(name)
                .code(code)
                .description(description)
                .activated(activated)
                .token(token)
                .build();

        if (users != null) {
            List<SpaceUser> spaceUsers = users.stream().map(
                    (spaceUser) -> SpaceUser.builder()
                            .id(spaceUser.getId())
                            .user(com.mindplates.bugcase.biz.user.entity.User.builder().id(spaceUser.getUserId()).build())
                            .role(spaceUser.getRole())
                            .CRUD(spaceUser.getCRUD())
                            .space(space).build()).collect(Collectors.toList());

            space.setUsers(spaceUsers);
        }

        return space;
    }


}