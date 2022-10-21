package com.mindplates.bugcase.biz.testcase.vo.response;

import com.mindplates.bugcase.biz.testcase.entity.TestcaseItemFile;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestcaseItemFileResponse {
    private Long id;
    private String name;
    private String type;
    private String path;
    private Long size;

    private String spaceCode;

    private Long projectId;

    private Long testcaseId;

    public TestcaseItemFileResponse(TestcaseItemFile testcaseItemFile, String spaceCode, Long projectId, Long testcaseId) {
        this.id = testcaseItemFile.getId();
        this.name = testcaseItemFile.getName();
        this.type = testcaseItemFile.getType();
        this.path = testcaseItemFile.getPath();
        this.size = testcaseItemFile.getSize();
        this.spaceCode = spaceCode;
        this.projectId = projectId;
        this.testcaseId = testcaseId;

    }
}