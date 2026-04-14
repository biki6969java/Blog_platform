package com.biki.Blog_platform.Service;

import com.biki.Blog_platform.ExceptionHandling.ResourceNotFoundException;
import com.biki.Blog_platform.Repository.UserRepo;
import com.biki.Blog_platform.model.Role;
import com.biki.Blog_platform.model.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepo repo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public User register(String username, String email, String password) {
        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("email already in use :" + email);
        }
        if (repo.existsByUsername(username)) {
            throw new IllegalArgumentException("username already taken " + username);
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(Role.ROLE_USER);
        user.setEnabled(true);

        if (repo.count() == 0) {
            user.setRole(Role.ROLE_ADMIN);
        }
        return repo.save(user);

    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("no user with this email"));
        return org.springframework.security.core.userdetails.User.withUsername(String.valueOf(user.getId()))
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority(user.getRole().name()))
                .disabled(!user.isEnabled())
                .build();
    }


    public User oathUser(String email,String displayName,String provider,String providerId,String avatarUrl){
        User user = repo.findByProviderAndProviderId(provider,providerId).or(()->
                repo.findByEmail(email)).orElseGet(User::new);

        boolean isNewUser = (user == null);
        if(isNewUser){
            String baseUsername=(displayName!=null  && !displayName.isBlank())
                    ? displayName.trim().toLowerCase().replaceAll("\\s","")
                    : email.split("@")[0].toLowerCase();

            String uniqueUsername = baseUsername;
            int counter =1 ;
            while(repo.existsByUsername(uniqueUsername)){
                uniqueUsername = baseUsername+counter++;
            }
            user.setUsername(uniqueUsername);
            user.setEmail(email);
            user.setPassword(encoder.encode(UUID.randomUUID().toString()));
            user.setRole(Role.ROLE_USER);
            user.setEnabled(true);
        }
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setAvatarUrl(avatarUrl);
        return repo.saveAndFlush(user);
        //return repo.save(user);
    }
    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        User user = repo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("no user with this id"));

        return org.springframework.security.core.userdetails.User
                .withUsername(String.valueOf(user.getId()))
                .password(user.getPassword() != null ? user.getPassword() : "") // ✅ handle null
                .authorities(new SimpleGrantedAuthority(user.getRole().name()))
                .disabled(!user.isEnabled())
                .build();
    }

    @Transactional(readOnly = true)
    public User getMyProfile(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceAccessException("User not found"));
    }

    public User updateMyProfile(Long id, String newUsername) {
        User user = getMyProfile(id);
        if (!user.getUsername().equals(newUsername) && repo.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("username already taken" + newUsername);
        }
        user.setUsername(newUsername);
        return repo.save(user);
    }

    public User updateEmail(Long id, String newEmail) {
        User user = getMyProfile(id);
        if (!user.getEmail().equals(newEmail) && repo.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("email already in use :" + newEmail);
        }
        user.setEmail(newEmail);
        return repo.save(user);
    }

    public void ChangePassword(Long id,String oldPassword,String newPassword){
        User user = getMyProfile(id);
        if(!encoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect ");
        }
        user.setPassword(encoder.encode(newPassword));
        repo.save(user);
    }

    public void deleteMyAccount(Long id, String password) {
        User user = getMyProfile(id);
        if (!encoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Password is incorrect ");
        }
        repo.delete(user);
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    public User getUserById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id : " + id));
    }

    public User getProfile(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found " + username));

    }

    public User getByUsername(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found " + username));
    }

    public List<User> searchUsername(String keyword){
        return repo.findByUsernameContainingIgnoreCase(keyword);
    }

    public User setEnabled(Long id,boolean enable){
        User user = repo.findById(id).orElseThrow(()->
                new ResourceNotFoundException("User not found with id : " + id));
        user.setEnabled(enable);
        return repo.save(user);
    }

    public User promoteUser(Long id){
        User user = repo.findById(id).orElseThrow(()->
        new ResourceNotFoundException("User not found with id : " + id));
        user.setRole(Role.ROLE_ADMIN);
        return repo.save(user);
    }

    public User demoteUser(Long id) {
        User user = repo.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id : " + id));
        user.setRole(Role.ROLE_USER);
        return repo.save(user);
    }

    public void deleteUser(Long id){
        User user = repo.findById(id).orElseThrow(()->
                new ResourceNotFoundException("User not found with id : " + id));
        repo.delete(user);
    }
    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

}
