/**
 * idle    → waiting for the guest to open the invitation
 * opening → seal breaks, flap opens, card rises and comes forward
 * card    → card is presented; the intro hands over to the site shortly after
 */
export type IntroPhase = 'idle' | 'opening' | 'card'

export interface InvitationRendererProps {
  phase: IntroPhase
  /** Called once the card has been fully presented. */
  onRevealed: () => void
}
