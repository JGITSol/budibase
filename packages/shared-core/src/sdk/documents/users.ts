import { ContextUser, User } from "@budibase/types"
import { getProdAppID } from "./applications"

// checks if a user is specifically a builder, given an app ID
export function isBuilder(user: User | ContextUser, appId?: string): boolean {
  if (!user) {
    return false
  }
  if (user.builder?.global) {
    return true
  } else if (appId && user.builder?.apps?.includes(getProdAppID(appId))) {
    return true
  }
  return false
}

export function isGlobalBuilder(user: User | ContextUser): boolean {
  return (isBuilder(user) && !hasAppBuilderPermissions(user)) || isAdmin(user)
}

// alias for hasAdminPermission, currently do the same thing
// in future whether someone has admin permissions and whether they are
// an admin for a specific resource could be separated
export function isAdmin(user: User | ContextUser): boolean {
  if (!user) {
    return false
  }
  return hasAdminPermissions(user)
}

export function isAdminOrBuilder(
  user: User | ContextUser,
  appId?: string
): boolean {
  return isBuilder(user, appId) || isAdmin(user)
}

// check if they are a builder within an app (not necessarily a global builder)
export function hasAppBuilderPermissions(user?: User | ContextUser): boolean {
  if (!user) {
    return false
  }
  const appLength = user.builder?.apps?.length
  const isGlobalBuilder = !!user.builder?.global
  return !isGlobalBuilder && appLength != null && appLength > 0
}

// checks if a user is capable of building any app
export function hasBuilderPermissions(user?: User | ContextUser): boolean {
  if (!user) {
    return false
  }
  return user.builder?.global || hasAppBuilderPermissions(user)
}

// checks if a user is capable of being an admin
export function hasAdminPermissions(user?: User | ContextUser): boolean {
  if (!user) {
    return false
  }
  return !!user.admin?.global
}
