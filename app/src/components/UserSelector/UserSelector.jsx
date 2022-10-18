import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './UserSelector.scss';
import { USER_ASSIGNED_OPERATIONS } from '@/constants/constants';
import { getUserText } from '@/utils/userUtil';

function UserSelector({ className, users, type, value, size, disabled, onChange, placeholder, color }) {
  const [opened, setOpened] = useState(false);
  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const element = useRef(null);

  const handleChange = (t, v) => {
    onChange(t, v);
    setOpened(false);
    setText('');
  };

  const filteredUser = users.filter(d => {
    if (text) {
      return d.name.toLowerCase().indexOf(text.toLowerCase()) > -1 || d.email.toLowerCase().indexOf(text.toLowerCase()) > -1;
    }

    return true;
  });

  return (
    <div className={`user-selector-wrapper ${className} size-${size} color-${color}`}>
      <div className="control">
        <input
          ref={element}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          onChange={e => {
            setText(e.target.value);
          }}
          onFocus={() => {
            setText(getUserText(users, type, value) || '');
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const filteredList = users.filter(d => d.name.toLowerCase().indexOf(text.toLowerCase()) > -1 || d.email.toLowerCase().indexOf(text.toLowerCase()) > -1);
              if (filteredList.length === 1) {
                handleChange('user', filteredList[0].id);
                element.current.blur();
              } else {
                setOpened(true);
              }
            }

            if (e.key === 'Escape') {
              setOpened(false);
              element.current.blur();
            }
          }}
          value={focus ? text : getUserText(users, type, value) || ''}
        />
      </div>
      <div
        className="icon"
        onClick={() => {
          setText('');
          setOpened(!opened);
        }}
      >
        <div>
          <i className="fa-solid fa-caret-down" />
        </div>
      </div>
      {opened && (
        <div className="user-list g-no-select">
          <ul>
            <li
              className={`special-option ${type === 'operation' && value === 'RND' ? 'selected' : ''}`}
              onClick={() => {
                handleChange('operation', 'RND');
              }}
            >
              <div className="name">{USER_ASSIGNED_OPERATIONS.RND}</div>
            </li>
            <li
              className={`special-option ${type === 'operation' && value === 'SEQ' ? 'selected' : ''}`}
              onClick={() => {
                handleChange('operation', 'SEQ');
              }}
            >
              <div className="name">{USER_ASSIGNED_OPERATIONS.SEQ}</div>
            </li>
            {filteredUser?.length < 1 && (
              <li className="empty">
                <div className="name">&#39;{text}&#39; 일치하는 사용자가 없습니다.</div>
              </li>
            )}

            {filteredUser?.map(user => {
              return (
                <li
                  key={user.id}
                  className={`user-options ${type === 'user' && user.id === value ? 'selected' : ''}`}
                  onClick={() => {
                    handleChange('user', user.id);
                  }}
                >
                  <div className="name">{user.name}</div>
                  <div className="email">
                    <span>{user.email}</span>
                  </div>
                  {filteredUser?.length === 1 && (
                    <div className="enter">
                      <span>
                        enter <i className="fa-solid fa-caret-up" />
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

UserSelector.defaultProps = {
  className: '',

  size: 'md',
  type: '',
  value: '',

  disabled: false,

  onChange: null,
  placeholder: '',

  color: 'black',

  users: [],
};

UserSelector.propTypes = {
  className: PropTypes.string,

  size: PropTypes.oneOf(['xxl', 'xl', 'lg', 'md', 'sm', 'xs']),
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  disabled: PropTypes.bool,

  onChange: PropTypes.func,
  placeholder: PropTypes.string,

  color: PropTypes.string,

  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      email: PropTypes.string,
    }),
  ),
};

export default UserSelector;