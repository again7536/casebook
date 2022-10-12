import React, { useCallback, useEffect, useState } from 'react';
import { Page, PageContent, PageTitle } from '@/components';
import { useTranslation } from 'react-i18next';
import ProjectService from '@/services/ProjectService';
import { useParams } from 'react-router';
import './ProjectTestcaseInfoPage.scss';
import TestcaseService from '@/services/TestcaseService';
import { cloneDeep } from 'lodash';
import TestcaseGroup from '@/pages/spaces/projects/ProjectTestcaseInfoPage/TestcaseGroup';

function ProjectTestcaseInfoPage() {
  const { t } = useTranslation();
  const { projectId, spaceCode } = useParams();
  const [project, setProject] = useState(null);
  const [testcaseGroups, setTestcaseGroups] = useState([]);
  const [selectedItemInfo, setSelectedItemInfo] = useState({
    id: null,
    type: null,
  });

  const getProject = useCallback(() => {
    ProjectService.selectProjectInfo(spaceCode, projectId, info => {
      setProject(info);
    });
  }, [spaceCode, projectId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    getProject();
  }, [spaceCode, projectId]);

  useEffect(() => {
    let nextGroups = [];
    if (project?.testcaseGroups?.length > 0) {
      const groups = cloneDeep(project?.testcaseGroups);
      const depths = groups.map(d => d.depth) || [];
      const maxDepth = Math.max(...depths);

      for (let i = maxDepth; i >= 0; i -= 1) {
        const targetDepthGroups = groups.filter(d => d.depth === i);
        if (i === 0) {
          nextGroups = nextGroups.concat(targetDepthGroups);
        } else {
          targetDepthGroups.forEach(d => {
            const parentGroup = groups.find(group => group.id === d.parentId);
            if (parentGroup) {
              if (!parentGroup?.children) {
                parentGroup.children = [];
              }

              parentGroup.children.push(d);
            } else {
              console.log(`NO PARENT - ${d.parentId}`);
            }
          });
        }
      }
    }

    setTestcaseGroups(nextGroups);
  }, [project]);

  const addTestcaseGroup = () => {
    const name = `그룹-${(testcaseGroups?.length || 0) + 1}`;
    let testcaseGroup = {
      parentId: null,
      name,
      testcases: [],
    };

    if (selectedItemInfo.type === 'group' && selectedItemInfo.id) {
      const selectedGroup = project.testcaseGroups.find(d => d.id === selectedItemInfo.id);

      testcaseGroup = {
        parentId: selectedGroup.id,
        name,
        testcases: [],
      };
    }

    TestcaseService.createTestcaseGroup(spaceCode, projectId, testcaseGroup, info => {
      const nextProject = { ...project };
      const nextTestcaseGroups = nextProject.testcaseGroups?.slice(0) || [];
      nextTestcaseGroups.push(info);
      nextProject.testcaseGroups = nextTestcaseGroups;

      setProject(nextProject);
    });
  };

  const addTestcase = () => {
    if (selectedItemInfo.type === 'group' && selectedItemInfo.id) {
      const group = project.testcaseGroups.find(d => d.id === selectedItemInfo.id);
      const name = `테스트케이스-${(group?.testcases?.length || 0) + 1}`;
      const testcase = {
        testcaseGroupId: selectedItemInfo.id,
        name,
        testcases: [],
      };

      TestcaseService.createTestcase(spaceCode, projectId, selectedItemInfo.id, testcase, info => {
        const nextProject = { ...project };
        const nextTestcaseGroup = nextProject.testcaseGroups.find(d => d.id === selectedItemInfo.id);
        if (!nextTestcaseGroup.testcases) {
          nextTestcaseGroup.testcases = [];
        }
        nextTestcaseGroup.testcases.push(info);
        setProject(nextProject);
      });
    }
  };

  const onPositionChange = changeInfo => {
    if (changeInfo.targetType === 'group' && changeInfo.destinationType === 'group') {
      TestcaseService.updateTestcaseGroupOrders(spaceCode, projectId, changeInfo, () => {
        getProject();
      });
    } else if (changeInfo.targetType === 'case' && changeInfo.destinationType === 'group') {
      TestcaseService.updateTestcaseTestcaseGroup(spaceCode, projectId, changeInfo.targetId, changeInfo, () => {
        getProject();
      });
    } else if (changeInfo.targetType === 'case' && changeInfo.destinationType === 'case') {
      TestcaseService.updateTestcaseOrder(spaceCode, projectId, changeInfo.targetId, changeInfo, () => {
        getProject();
      });
    }
  };

  const onDeleteTestcaseGroup = (type, id) => {
    if (type === 'group') {
      TestcaseService.deleteTestcaseGroup(spaceCode, projectId, id, () => {
        setSelectedItemInfo({
          id: null,
          type: null,
        });

        getProject();
      });
    } else if (type === 'case') {
      TestcaseService.deleteTestcase(spaceCode, projectId, id, () => {
        setSelectedItemInfo({
          id: null,
          type: null,
        });

        getProject();
      });
    }
  };

  const onChangeTestcaseGroupName = (type, id, name) => {
    if (type === 'group') {
      TestcaseService.updateTestcaseGroupName(spaceCode, projectId, id, name, info => {
        const nextProject = { ...project };
        const inx = project?.testcaseGroups.findIndex(d => d.id === info.id);
        if (inx > -1) {
          nextProject.testcaseGroups[inx] = info;
          setProject(nextProject);
        }
      });
    } else if (type === 'case') {
      TestcaseService.updateTestcaseName(spaceCode, projectId, id, name, info => {
        const nextProject = { ...project };
        const nextGroup = project?.testcaseGroups.find(d => d.id === info.testcaseGroupId);
        const inx = nextGroup.testcases.findIndex(d => d.id === info.id);
        if (inx > -1) {
          nextGroup.testcases[inx] = info;
          setProject(nextProject);
        }
      });
    }
  };

  return (
    <Page className="project-testcase-info-page-wrapper" list wide>
      <PageTitle>{t('테스트케이스')}</PageTitle>
      <PageContent className="page-content">
        <div className="page-layout">
          <div className="testcase-groups">
            <TestcaseGroup
              testcaseGroups={testcaseGroups}
              addTestcaseGroup={addTestcaseGroup}
              addTestcase={addTestcase}
              onPositionChange={onPositionChange}
              onChangeTestcaseGroupName={onChangeTestcaseGroupName}
              selectedItemInfo={selectedItemInfo}
              onSelect={setSelectedItemInfo}
              onDelete={onDeleteTestcaseGroup}
            />
          </div>
          <div className="border-line" />
          <div className="testcases">
            <div className="content-scroller" />
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

ProjectTestcaseInfoPage.defaultProps = {};

ProjectTestcaseInfoPage.propTypes = {};

export default ProjectTestcaseInfoPage;