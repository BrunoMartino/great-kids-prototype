import {
  AppUser,
  DuplicateEmailError,
  type AppUserCreateInput,
  type AppUserRecord,
} from "@/models/app_user";
import { HolderPolicy } from "@/app/api/app-users/holder-policy";

export { DuplicateEmailError };

export async function createTitular(p_input: AppUserCreateInput): Promise<AppUserRecord> {
  HolderPolicy.assertCanBeTitular(p_input.role);
  return AppUser.instance.create(p_input);
}
