package com.mindplates.bugcase.biz.space.vo.response;

import com.mindplates.bugcase.biz.space.entity.Space;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimpleSpaceResponse {
    private Long id;
    private String name;
    private String code;
    private Boolean activated;

    public SimpleSpaceResponse(Space space) {
        this.id = space.getId();
        this.name = space.getName();
        this.code = space.getCode();
        this.activated = space.getActivated();
    }


}