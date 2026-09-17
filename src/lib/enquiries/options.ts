/** Client-safe choices shared by the preview and inactive enquiry contract.
 * No runtime integration, credentials, network access or booking availability.
 */
export const enquiryOptions = {
  supplier: ["Howdens", "Wren Kitchens", "B&Q", "Wickes", "Magnet", "DIY Kitchens", "Other", "Still deciding"],
  removal: ["Yes, please include removal", "No, it will be removed", "It has already been removed", "Not sure yet"],
  stage: ["Just exploring ideas", "Ready to discuss a design", "I have a layout or plans", "Ready to get started"],
  style: ["Modern & minimal", "Warm & natural", "Classic / shaker", "A mix of styles", "I have inspiration to share"],
  timing: ["As soon as practical", "In 1–3 months", "In 3–6 months", "Later this year / next year"],
  services: [
    "Existing kitchen removal", "Cabinets & fitting", "Worktops", "Flooring", "Internal wooden doors",
    "Appliance installation", "Plumbing coordination", "Electrical-work coordination", "Gas-work coordination",
    "Tiling coordination", "Plastering coordination", "Specialist trades", "Help me decide",
  ],
  trades: ["I have my own tradespeople", "Please coordinate the trades needed", "A mixture of my own and coordinated trades"],
  time: ["Morning", "Afternoon", "Please call to arrange"],
  contact: ["Phone", "Email"],
  fileTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;
