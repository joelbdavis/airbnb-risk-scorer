import type { RiskRule } from '../ruleRegistry';

export const noProfilePictureRule: RiskRule = {
  id: 'no-profile-picture',
  name: 'No Profile Picture',
  defaultScore: 10,
  defaultEnabled: true,
  rationale: 'Guest has not uploaded a profile picture.',
  applies: (guest) => !guest.profile_picture,
  category: 'identity',
};
