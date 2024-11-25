import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, EmptyContent } from '@/components';
import PropTypes from 'prop-types';
import TestcaseNavigatorGroupItem from '@/pages/spaces/projects/ProjectTestcaseEditPage/TestcaseNavigator/TestcaseNavigatorGroupItem';
import TestcaseNavigatorContextMenu from '@/pages/spaces/projects/ProjectTestcaseEditPage/TestcaseNavigator/TestcaseNavigatorContextMenu';
import { NullableNumber, NullableString, TestcaseGroupPropTypes } from '@/proptypes';
import { useResizeDetector } from 'react-resize-detector';
import { getOption, setOption } from '@/utils/storageUtil';
import TestcaseGroupSetting from '@/pages/spaces/projects/ProjectTestcaseEditPage/TestcaseNavigator/TestcaseNavigatorSetting';
import dialogUtil from '@/utils/dialogUtil';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import TestcaseNavigatorControl from './TestcaseNavigatorControl';
import filteringTestcaseGroupList from './testcaseFilterUtils';
import './TestcaseNavigator.scss';

function TestcaseNavigator({
  testcaseGroups,
  addTestcaseGroup,
  onPositionChange,
  selectedItemInfo,
  onSelect,
  onDelete,
  onChangeTestcaseGroupName,
  addTestcase,
  contentChanged,
  user,
  users,
  userFilter,
  setUserFilter,
  showTestResult,
  watcherInfo,
  enableDrag,
  copyTestcase,
  onDragStart,
  nodeById,
}) {
  const { t } = useTranslation();
  const scroller = useRef(null);

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'throttle',
    refreshRate: 100,
  });

  const dragInfo = useRef({
    targetType: null,
    targetId: null,
    destinationType: null,
    destinationId: null,
    toChildren: false,
  }).current;

  const [editInfo, setEditInfo] = useState({
    type: null,
    id: null,
    name: '',
    clickTime: null,
    clickId: null,
  });

  const [dragChange, setDragChange] = useState(null);
  const [contextMenuInfo, setContextMenuInfo] = useState({
    type: null,
    id: null,
    x: null,
    y: null,
    name: '',
  });

  const [copyInfo, setCopyInfo] = useState({
    type: null,
    id: null,
    name: '',
  });

  const [testcaseFilter, setTestcaseFilter] = useState({
    words: [],
    releaseIds: [],
  });

  const [allOpen, setAllOpen] = useState(true);

  const [setting, setSetting] = useState(() => {
    const storageSetting = getOption('testcase', 'testcase-group-layout', 'setting') || {};
    if (storageSetting?.testcaseColumns?.closed) {
      delete storageSetting?.testcaseColumns?.closed;
    }

    if (storageSetting?.testcaseGroupColumns?.testcase) {
      delete storageSetting?.testcaseGroupColumns?.testcase;
    }

    return {
      show: false,
      testcaseGroupColumns: {
        id: {
          show: false,
          name: t('아이디'),
        },
        itemOrder: {
          show: false,
          name: t('순서'),
        },
        testcaseCount: {
          show: false,
          name: t('테스트케이스 개수'),
        },
        ...storageSetting?.testcaseGroupColumns,
      },
      testcaseColumns: {
        id: {
          show: false,
          name: t('아이디'),
        },
        itemOrder: {
          show: false,
          name: t('순서'),
        },
        ...storageSetting?.testcaseColumns,
      },
    };
  });

  const list = useMemo(() => {
    if (testcaseFilter.words.length === 0 && testcaseFilter.releaseIds.length === 0) {
      return testcaseGroups;
    }

    return filteringTestcaseGroupList(testcaseGroups, testcaseFilter);
  }, [testcaseFilter, testcaseGroups]);

  const setDragInfo = info => {
    setDragChange(Date.now());

    Object.keys(info).forEach(key => {
      dragInfo[key] = info[key];
    });
  };

  const onDrop = e => {
    e.stopPropagation();
    if (dragInfo.destinationId && onPositionChange) {
      onPositionChange(dragInfo);
    }
  };

  const changeSelect = info => {
    if (selectedItemInfo.id && contentChanged) {
      dialogUtil.setConfirm(
        MESSAGE_CATEGORY.WARNING,
        t('변경된 데이터가 저장되지 않았습니다.'),
        <div>{t('변경 후 저장되지 않은 데이터가 있습니다. 저장하지 않고, 다른 데이터를 불러오시겠습니까?')}</div>,
        () => {
          onSelect(info);
        },
      );
    } else {
      onSelect(info);
    }
  };

  const onContextMenu = (e, type, id, name) => {
    if (onDelete) {
      e.preventDefault();

      if (selectedItemInfo.id && contentChanged) {
        dialogUtil.setConfirm(
          MESSAGE_CATEGORY.WARNING,
          t('변경된 데이터가 저장되지 않았습니다.'),
          <div>{t('변경 후 저장되지 않은 데이터가 있습니다. 저장하지 않고, 다른 데이터를 불러오시겠습니까?')}</div>,
          () => {
            onSelect({ id, type });
            setContextMenuInfo({
              type,
              id,
              x: e.pageX + 20,
              y: e.pageY,
              name,
            });
          },
        );
      } else {
        onSelect({ id, type });
        setContextMenuInfo({
          type,
          id,
          x: e.pageX + 20,
          y: e.pageY,
          name,
        });
      }
    }
  };

  const onClearContextMenu = () => {
    setContextMenuInfo({
      type: null,
      id: null,
      x: null,
      y: null,
      name: '',
    });
  };

  const onClickGroupName = (type, item, force) => {
    if (editInfo.clickTime || force) {
      if (force || (editInfo.type === type && editInfo.clickId === item.id && Date.now() - editInfo.clickTime > 300 && Date.now() - editInfo.clickTime < 1200)) {
        setEditInfo({ ...editInfo, type, id: item.id, clickTime: null, name: item.name, clickId: null });
        setTimeout(() => {
          const e = document.querySelector('.testcase-groups-wrapper input.name-editor');
          if (e?.focus) {
            e.focus();
          }
          if (e?.select) {
            e.select();
          }
        }, 200);
      } else {
        setEditInfo({ ...editInfo, clickTime: null, clickId: null });
      }
    } else {
      setEditInfo({
        ...editInfo,
        type,
        clickTime: Date.now(),
        clickId: item.id,
      });
    }
  };

  const onCopy = (type, id, name) => {
    setCopyInfo({
      type,
      id,
      name,
    });
  };

  const onPaste = (type, id) => {
    copyTestcase(copyInfo.type, copyInfo.id, type, id);
  };

  const clearEditing = () => {
    setEditInfo({ type: null, id: null, clickTime: null, name: '', clickId: null });
  };

  const onChangeEditName = name => {
    setEditInfo({
      ...editInfo,
      name,
    });
  };

  const onChangeTestcaseFilter = useCallback(filter => {
    startTransition(() => {
      setTestcaseFilter(filter);
    });
  }, []);

  useEffect(() => {
    if (selectedItemInfo.time && scroller.current) {
      setTimeout(() => {
        const focusElement = scroller.current?.querySelector('.selected');

        if (focusElement) {
          const scrollerRect = scroller.current.getClientRects();
          const elementRect = focusElement.getClientRects();

          if (scrollerRect?.length > 0 && elementRect?.length > 0) {
            scroller.current.scrollTop = scroller.current.scrollTop + elementRect[0].y - scrollerRect[0].y - 16;
          }
        }
      }, 200);
    }
  }, [selectedItemInfo.time]);

  const onChangeSetting = (category, key, value) => {
    const nextSetting = {
      ...setting,
      [category]: {
        ...setting[category],
        [key]: {
          ...setting[category][key],
          show: value,
        },
      },
    };
    setSetting(nextSetting);

    setOption('testcase', 'testcase-group-layout', 'setting', nextSetting);
  };

  return (
    <div className="testcase-groups-wrapper g-no-select" ref={ref}>
      <TestcaseNavigatorControl
        width={width}
        user={user}
        users={users}
        userFilter={userFilter}
        selectedItemInfo={selectedItemInfo}
        testcaseFilter={testcaseFilter}
        addTestcase={addTestcase}
        addTestcaseGroup={addTestcaseGroup}
        onChangeUserFilter={setUserFilter}
        onClickAllOpen={setAllOpen}
        onChangeTestcaseFilter={onChangeTestcaseFilter}
      />
      <div
        className="testcase-groups-content"
        onClick={() => {
          changeSelect({
            id: null,
            type: null,
            time: null,
          });
        }}
      >
        <div className={`content-scroller ${dragChange}`} ref={scroller}>
          {list?.length < 1 && (
            <EmptyContent className="empty-content">
              <div>{t('테스트케이스 그룹이 없습니다.')}</div>
              {addTestcaseGroup && (
                <div className="empty-control">
                  <Button
                    outline
                    size="sm"
                    onClick={() => {
                      addTestcaseGroup(false);
                    }}
                  >
                    {width < 180 && (
                      <>
                        <i className="fa-solid fa-folder-plus" /> <span className="button-text">{t('그룹')}</span>
                      </>
                    )}
                    {width >= 180 && (
                      <>
                        <i className="fa-solid fa-folder-plus" /> <span className="button-text">{t('테스트케이스 그룹')}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </EmptyContent>
          )}
          {list?.length > 0 && (
            <ul>
              {list.map(group => {
                return (
                  <TestcaseNavigatorGroupItem
                    key={group.id}
                    group={group}
                    dragInfo={dragInfo}
                    setDragInfo={setDragInfo}
                    onDrop={onDrop}
                    enableDrag={enableDrag}
                    editInfo={editInfo}
                    contextMenuInfo={contextMenuInfo}
                    onContextMenu={onContextMenu}
                    selectedItemInfo={selectedItemInfo}
                    onSelect={changeSelect}
                    lastChild={false}
                    onChangeEditName={onChangeEditName}
                    clearEditing={clearEditing}
                    onChangeTestcaseGroupName={onChangeTestcaseGroupName}
                    onClickGroupName={onClickGroupName}
                    allOpen={allOpen}
                    setAllOpen={setAllOpen}
                    setting={setting}
                    showTestResult={showTestResult}
                    watcherInfo={watcherInfo}
                    copyInfo={copyInfo}
                    onDragStart={onDragStart}
                    nodeById={nodeById}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="testcase-config-button">
        <Button
          size="xs"
          outline
          onClick={() => {
            setSetting({
              ...setting,
              show: true,
            });
          }}
          rounded
        >
          <i className="fa-solid fa-gear" />
        </Button>
        <TestcaseGroupSetting
          setting={setting}
          onChangeSetting={onChangeSetting}
          onClose={() => {
            setSetting({
              ...setting,
              show: false,
            });
          }}
        />
      </div>
      {onDelete && (
        <TestcaseNavigatorContextMenu
          onDelete={onDelete}
          onClearContextMenu={onClearContextMenu}
          onClickGroupName={onClickGroupName}
          contextMenuInfo={contextMenuInfo}
          onCopy={onCopy}
          copyInfo={copyInfo}
          onPaste={onPaste}
        />
      )}
    </div>
  );
}

TestcaseNavigator.defaultProps = {
  testcaseGroups: [],
  selectedItemInfo: {
    id: null,
    type: null,
    time: null,
  },
  addTestcaseGroup: null,
  addTestcase: null,
  onPositionChange: null,
  onSelect: null,
  onChangeTestcaseGroupName: null,
  onDelete: null,
  contentChanged: false,
  user: null,
  users: [],
  userFilter: null,
  setUserFilter: null,
  showTestResult: false,
  enableDrag: true,
  watcherInfo: {},
  copyTestcase: null,
  onDragStart: null,
  nodeById: {},
};

TestcaseNavigator.propTypes = {
  testcaseGroups: PropTypes.arrayOf(TestcaseGroupPropTypes),
  addTestcaseGroup: PropTypes.func,
  addTestcase: PropTypes.func,
  onPositionChange: PropTypes.func,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  selectedItemInfo: PropTypes.shape({
    id: NullableNumber,
    type: NullableString,
    time: NullableNumber,
  }),
  onChangeTestcaseGroupName: PropTypes.func,
  contentChanged: PropTypes.bool,
  user: PropTypes.shape({
    id: PropTypes.number,
  }),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
    }),
  ),
  setUserFilter: PropTypes.func,
  userFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showTestResult: PropTypes.bool,
  enableDrag: PropTypes.bool,
  watcherInfo: PropTypes.shape({
    [PropTypes.number]: PropTypes.shape({
      userId: PropTypes.number,
      userEmail: PropTypes.string,
    }),
  }),
  copyTestcase: PropTypes.func,
  onDragStart: PropTypes.func,
  nodeById: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};

export default observer(TestcaseNavigator);
