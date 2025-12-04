import whatsappService from '../services/whatsappService'
import contactsService from '../services/contactsService'
import authService from '../services/authService'

/**
 * Handles the campaign flow navigation:
 * Always starts by going to ConnectWhatsApp page to confirm phone number
 * The ConnectWhatsApp page will handle the rest of the flow
 */
export async function navigateToCampaign(navigate) {
  // Always go to ConnectWhatsApp first to show phone confirmation dialog
  // The ConnectWhatsApp page will handle checking connection and continuing the flow
  navigate('/connect-whatsapp', { state: { returnTo: 'campaign' } })
}

