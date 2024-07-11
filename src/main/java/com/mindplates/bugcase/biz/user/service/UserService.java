package com.mindplates.bugcase.biz.user.service;

import com.mindplates.bugcase.biz.ai.repository.AiRequestHistoryRepository;
import com.mindplates.bugcase.biz.project.repository.ProjectUserRepository;
import com.mindplates.bugcase.biz.space.repository.SpaceApplicantRepository;
import com.mindplates.bugcase.biz.space.repository.SpaceUserRepository;
import com.mindplates.bugcase.biz.testrun.repository.TestrunCommentRepository;
import com.mindplates.bugcase.biz.testrun.repository.TestrunTestcaseGroupTestcaseCommentRepository;
import com.mindplates.bugcase.biz.testrun.repository.TestrunTestcaseGroupTestcaseRepository;
import com.mindplates.bugcase.biz.testrun.repository.TestrunUserRepository;
import com.mindplates.bugcase.biz.user.dto.UserDTO;
import com.mindplates.bugcase.biz.user.entity.User;
import com.mindplates.bugcase.biz.user.repository.UserRepository;
import com.mindplates.bugcase.biz.user.repository.UserTokenRepository;
import com.mindplates.bugcase.common.code.SystemRole;
import com.mindplates.bugcase.common.exception.ServiceException;
import com.mindplates.bugcase.common.util.EncryptUtil;
import com.mindplates.bugcase.common.util.MappingUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EncryptUtil encryptUtil;
    private final MappingUtil mappingUtil;
    private final SpaceApplicantRepository spaceApplicantRepository;
    private final SpaceUserRepository spaceUserRepository;
    private final TestrunTestcaseGroupTestcaseCommentRepository testrunTestcaseGroupTestcaseCommentRepository;
    private final TestrunCommentRepository testrunCommentRepository;
    private final TestrunTestcaseGroupTestcaseRepository testrunTestcaseGroupTestcaseRepository;
    private final TestrunUserRepository testrunUserRepository;
    private final ProjectUserRepository projectUserRepository;
    private final AiRequestHistoryRepository aiRequestHistoryRepository;
    private final UserTokenRepository userTokenRepository;

    public UserDTO selectUserInfo(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        return new UserDTO(user);
    }


    public boolean existUserByEmail(String email, Long exceptUserId) {
        if (exceptUserId != null) {
            return userRepository.countByEmailAndIdNot(email, exceptUserId) > 0L;
        }
        return userRepository.countByEmail(email) > 0L;
    }

    private void checkUserValidation(UserDTO user) {
        boolean existEmailUser = existUserByEmail(user.getEmail(), null);
        if (existEmailUser) {
            throw new ServiceException("error.exist.email");
        }
    }

    @Transactional
    public UserDTO createUser(UserDTO user, SystemRole role) {
        checkUserValidation(user);

        String plainText = user.getPassword();
        byte[] saltBytes = encryptUtil.getSaltByteArray();
        String salt = encryptUtil.getSaltString(saltBytes);
        user.setSalt(salt);
        String encryptedText = encryptUtil.getEncrypt(plainText, saltBytes);
        user.setPassword(encryptedText);
        if (role == null) {
            user.setSystemRole(SystemRole.ROLE_USER);
            user.setActiveSystemRole(SystemRole.ROLE_USER);
        } else {
            user.setSystemRole(role);
            user.setActiveSystemRole(role);
        }

        user.setActivateYn(true);
        user.setActivateMailSendResult(false);
        user.setRecoveryToken("");
        user.setRecoveryMailSendResult(false);
        user.setUseYn(true);
        return new UserDTO(userRepository.save(mappingUtil.convert(user, User.class)));
    }

    @Transactional
    public UserDTO updateUser(Long userId, UserDTO user) {
        User targetUser = userRepository.findById(userId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        targetUser.setName(user.getName());
        targetUser.setLanguage(user.getLanguage());
        targetUser.setCountry(user.getCountry());
        targetUser.setTimezone(user.getTimezone());
        targetUser.setAvatarInfo(user.getAvatarInfo());
        if (targetUser.getSystemRole().equals(SystemRole.ROLE_ADMIN)) {
            targetUser.setActiveSystemRole(user.getActiveSystemRole());
        }
        return new UserDTO(userRepository.save(targetUser));
    }

    @Transactional
    public UserDTO updateUserByAdmin(Long userId, UserDTO user) {
        User targetUser = userRepository.findById(userId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        targetUser.setName(user.getName());
        targetUser.setLanguage(user.getLanguage());
        targetUser.setCountry(user.getCountry());
        targetUser.setTimezone(user.getTimezone());
        targetUser.setSystemRole(user.getSystemRole());
        targetUser.setActiveSystemRole(user.getActiveSystemRole());
        targetUser.setUseYn(user.getUseYn());
        targetUser.setActivateYn(user.getActivateYn());
        return new UserDTO(userRepository.save(targetUser));
    }

    @Transactional
    public void deleteUserByAdmin(Long userId) {
        User targetUser = userRepository.findById(userId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        spaceApplicantRepository.deleteByUserId(userId);
        spaceUserRepository.deleteByUserId(userId);
        testrunTestcaseGroupTestcaseCommentRepository.deleteByUserId(userId);
        testrunCommentRepository.deleteByUserId(userId);
        testrunTestcaseGroupTestcaseRepository.updateTesterNullByUserId(userId);
        testrunUserRepository.deleteByUserId(userId);
        projectUserRepository.deleteByUserId(userId);
        aiRequestHistoryRepository.updateTesterNullByUserId(userId);
        userTokenRepository.deleteByUserId(userId);

        userRepository.delete(targetUser);
    }

    @Transactional
    public UserDTO updateUserPassword(Long userId, String currentPassword, String newPassword) {
        User userInfo = userRepository.findById(userId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        String currentSalt = userInfo.getSalt();
        byte[] currentSaltBytes = new java.math.BigInteger(currentSalt, 16).toByteArray();
        String currentEncryptedText = encryptUtil.getEncrypt(currentPassword, currentSaltBytes);

        if (!userInfo.getPassword().equals(currentEncryptedText)) {
            throw new ServiceException(HttpStatus.BAD_REQUEST, "user.current.password.not.matched");
        }

        byte[] saltBytes = encryptUtil.getSaltByteArray();
        String salt = encryptUtil.getSaltString(saltBytes);
        userInfo.setSalt(salt);
        String encryptedText = encryptUtil.getEncrypt(newPassword, saltBytes);
        userInfo.setPassword(encryptedText);

        return new UserDTO(userRepository.save(userInfo));
    }

    @Transactional
    public UserDTO updateUserPasswordByAdmin(Long userId, String newPassword) {
        User userInfo = userRepository.findById(userId).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));

        byte[] saltBytes = encryptUtil.getSaltByteArray();
        String salt = encryptUtil.getSaltString(saltBytes);
        userInfo.setSalt(salt);
        String encryptedText = encryptUtil.getEncrypt(newPassword, saltBytes);
        userInfo.setPassword(encryptedText);

        return new UserDTO(userRepository.save(userInfo));
    }

    @Transactional
    public void updateUserLastSeen(Long userId, LocalDateTime lastSeen) {
        userRepository.updateUserLastSeen(userId, lastSeen);
    }


    public UserDTO login(String email, String password) {
        User userInfo = userRepository.findByEmail(email).orElseThrow(() -> new ServiceException(HttpStatus.NOT_FOUND));
        String salt = userInfo.getSalt();
        byte[] saltBytes = new java.math.BigInteger(salt, 16).toByteArray();
        String encryptedText = encryptUtil.getEncrypt(password, saltBytes);

        if (userInfo.getPassword().equals(encryptedText)) {
            return new UserDTO(userInfo);
        }

        return null;
    }

    public List<UserDTO> selectUserList() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserDTO::new).collect(Collectors.toList());
    }

}
