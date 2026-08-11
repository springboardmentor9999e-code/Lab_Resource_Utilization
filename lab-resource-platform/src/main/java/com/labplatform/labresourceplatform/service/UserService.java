package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Institution;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.repository.InstitutionRepository;
import com.labplatform.labresourceplatform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class  UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionRepository institutionRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, InstitutionRepository institutionRepository){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.institutionRepository = institutionRepository;
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public List<User> getUsers(Long institutionId, Role role){
        if (institutionId != null && role != null) {
            return userRepository.findByInstitution_InstitutionIdAndRole(institutionId, role);
        }
        if (institutionId != null) {
            return userRepository.findByInstitution_InstitutionId(institutionId);
        }
        if (role != null) {
            return userRepository.findByRole(role);
        }
        return getAllUsers();
    }

    public User getUserById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Security fix: an INSTITUTION_ADMINISTRATOR could previously set (or
    // create a user with) ANY role, including SYSTEM_ADMINISTRATOR - the
    // controller only checked institution boundaries, never the role ceiling.
    // Only SYSTEM_ADMINISTRATOR may assign SYSTEM_ADMINISTRATOR; an
    // INSTITUTION_ADMINISTRATOR may assign anything up to and including
    // INSTITUTION_ADMINISTRATOR itself (their own tier and below), matching
    // "you can't grant a privilege you don't have or higher than your own."
    private void assertCanAssignRole(Role actingRole, Role targetRole){
        if (targetRole == null) {
            return;
        }
        if (actingRole == Role.SYSTEM_ADMINISTRATOR) {
            return;
        }
        if (actingRole == Role.INSTITUTION_ADMINISTRATOR && targetRole != Role.SYSTEM_ADMINISTRATOR) {
            return;
        }
        throw new AccessDeniedException("You are not permitted to assign the " + targetRole + " role.");
    }

    public User createUser(User user, Role actingRole){
        assertCanAssignRole(actingRole, user.getRole());

        // The client only sends { institution: { institutionId: N } }. Re-fetch
        // the real, fully-loaded Institution so the response (and the row shown
        // until a full reload) has the actual institution name, not a bare id.
        if (user.getInstitution() != null) {
            user.setInstitution(fetchInstitution(user.getInstitution().getInstitutionId()));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    private Institution fetchInstitution(Long institutionId){
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found with id: " + institutionId));
    }

    public User updateUser(Long id, User updatedUser, Role actingRole){

        User existing = getUserById(id);

        // Checked against both the role being assigned AND the target's
        // current role - this blocks an INSTITUTION_ADMINISTRATOR from
        // demoting/reassigning an existing SYSTEM_ADMINISTRATOR too (not just
        // from promoting someone up to it), since editing any other field on a
        // SYSTEM_ADMINISTRATOR's account is itself a tier they don't outrank.
        if (updatedUser.getRole() != null) {
            assertCanAssignRole(actingRole, updatedUser.getRole());
        }
        assertCanAssignRole(actingRole, existing.getRole());

        if(updatedUser.getName() != null)
            existing.setName(updatedUser.getName());

        if(updatedUser.getEmail() != null)
            existing.setEmail(updatedUser.getEmail());

        if(updatedUser.getPassword() != null)
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));

        if(updatedUser.getRole() != null)
            existing.setRole(updatedUser.getRole());

        if(updatedUser.getInstitution() != null)
            // Same re-fetch as createUser() above.
            existing.setInstitution(fetchInstitution(updatedUser.getInstitution().getInstitutionId()));

        return userRepository.save(existing);
    }

    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }
}
