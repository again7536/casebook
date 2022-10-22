package com.mindplates.bugcase.common.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum UserRole {

  ADMIN("ADMIN"),
  USER("USER");
  private String code;

}
