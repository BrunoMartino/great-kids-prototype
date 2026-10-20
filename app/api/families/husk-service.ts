import { HolderPolicy } from "@/app/api/app-users/holder-policy";
import { getConnection } from "@/internal/db/connection";
import { AppUser } from "@/models/app_user";
import { Family, type FamilyRecord } from "@/models/family";
import { FamilyDiary } from "@/models/family_diary";
import { FamilyProfile } from "@/models/family_profile";

export type FamilyHuskInput = {
  holder_user_id: string;
  status: string;
};

export async function createFamilyHusk(p_input: FamilyHuskInput): Promise<FamilyRecord> {
  if (p_input.holder_user_id === "") {
    throw new Error("holder_user_id required");
  }
  const holder = AppUser.instance.findById(p_input.holder_user_id);
  if (holder === null) {
    throw new Error("holder not found");
  }
  HolderPolicy.assertCanBeTitular(holder.role);
  const database = getConnection();
  const runHusk = database.transaction((): FamilyRecord => {
    const profile = FamilyProfile.instance.insertEmpty();
    const diary = FamilyDiary.instance.insertEmpty();
    const membersId: string = crypto.randomUUID();
    return Family.instance.insert({
      fam_profile_id: profile.id,
      fam_diary_id: diary.id,
      status: p_input.status,
      family_members: JSON.stringify({
        id: membersId,
        members: [
          {
            user_id: holder.id,
            user_nickname: holder.nick_name,
            user_role: holder.role,
          },
        ],
      }),
      address: JSON.stringify({
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      }),
      holder_user_id: holder.id,
    });
  });
  return runHusk();
}
