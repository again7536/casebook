import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Message, ProjectBugInfoPage, ProjectEditPage, ProjectInfoPage, ProjectTestcaseEditPage, SpaceProjectListPage } from '@/pages';
import TestrunsRoutes from '@/pages/spaces/projects/testruns';
import ReportsRoutes from '@/pages/spaces/projects/reports';
import ReleasesRoutes from '@/pages/spaces/projects/releases';
import LinksRoutes from '@/pages/spaces/projects/links';
import SequencesRoutes from '@/pages/spaces/projects/sequences';

function ProjectsRoutes() {
  return (
    <Routes>
      <Route path="/new" element={<ProjectEditPage />} />
      <Route path="/:projectId/edit" element={<ProjectEditPage type="edit" />} />
      <Route path="/:projectId/info" element={<ProjectInfoPage />} />
      <Route path="/:projectId/testcases" element={<ProjectTestcaseEditPage />} />
      <Route path="/:projectId/testruns/*" element={<TestrunsRoutes />} />
      <Route path="/:projectId/bugs" element={<ProjectBugInfoPage />} />
      <Route path="/:projectId/reports/*" element={<ReportsRoutes />} />
      <Route path="/:projectId/links/*" element={<LinksRoutes />} />
      <Route path="/:projectId/releases/*" element={<ReleasesRoutes />} />
      <Route path="/:projectId/sequences/*" element={<SequencesRoutes />} />
      <Route path="/" element={<SpaceProjectListPage />} />
      <Route path="*" element={<Message code="404" />} />
    </Routes>
  );
}

export default ProjectsRoutes;
