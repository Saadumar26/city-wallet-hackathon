import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

interface QRResult {
  token: string;
  qrDataUrl: string;
}

export async function generateQR(
  offerId: string,
  userId: string,
): Promise<QRResult> {
  const token = `${offerId}_${userId}_${uuidv4()}`;
  const qrDataUrl = await QRCode.toDataURL(token, {
    margin: 1,
    width: 320,
    color: { dark: "#141412", light: "#ffffff" },
  });
  return { token, qrDataUrl };
}
