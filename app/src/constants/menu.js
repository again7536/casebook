import React from 'react';

const STATIC_MENUS = [
  {
    key: 'space',
    to: '/',
    icon: <i className="fas fa-home-alt" />,
    name: '스페이스',
    admin: false,
    pc: true,
    selectedAlias: [/^\/$/, /^\/spaces\/[A-Z]+(\/)?(edit|info)$/],
  },
  {
    key: 'project',
    to: '/projects',
    icon: <i className="fas fa-home-alt" />,
    name: '프로젝트',
    admin: false,
    pc: true,
    prefixSpace: true,
    selectedAlias: [/^\/spaces\/[\dA-Z]+\/projects$/],
  },
  {
    key: 'admin',
    to: '/admin',
    icon: <i className="fas fa-home-alt" />,
    name: '관리',
    admin: true,
    pc: true,
    prefixSpace: false,
    selectedAlias: [/^\/admin\/*/],
    list: [
      {
        key: 'systems',
        to: '/systems',
        name: '시스템 설정',
        admin: true,
      },
      {
        key: 'users',
        to: '/users',
        name: '사용자 관리',
        admin: true,
      },
      {
        key: 'spaces',
        to: '/spaces',
        name: '스페이스 관리',
        admin: true,
      },
    ],
  },
];

const MENUS = [
  {
    key: 'dashboard',
    to: '',
    icon: <i className="fa-solid fa-gauge" />,
    color: '#ffbc4b',
    name: '대시보드',
    admin: false,
    pc: true,
    login: true,
    project: true,
  },
  {
    key: 'bugs',
    to: '/bugs',
    icon: <i className="fa-solid fa-viruses" />,
    color: '#ff4935',
    name: '버그',
    admin: false,
    pc: true,
    login: true,
    project: true,
  },
  {
    key: 'testcases',
    to: '/testcases',
    icon: <i className="fa-solid fa-vial-virus" />,
    color: '#3e8ef1',
    name: '테스트케이스',
    admin: false,
    pc: true,
    login: true,
    project: true,
  },
  {
    key: 'testruns',
    to: '/testruns',
    icon: <i className="fa-solid fa-scale-balanced" />,
    color: '#7bde89',
    name: '테스트런',
    admin: false,
    pc: true,
    login: true,
    project: true,
    selectedAlias: [/^\/spaces\/[\dA-Z]+\/projects\/[\dA-Z]+\/testruns\/*/],
  },

  {
    key: 'reports',
    to: '/reports',
    icon: <i className="fa-regular fa-newspaper" />,
    color: '#a4c9d8',
    name: '리포트',
    admin: false,
    pc: true,
    login: true,
    project: true,
  },
  {
    key: 'info',
    to: '/info',
    icon: <i className="fa-solid fa-gear" />,
    color: '#837e7e',
    name: '설정',
    admin: false,
    pc: true,
    login: true,
    project: true,
  },
];

export { STATIC_MENUS, MENUS };
