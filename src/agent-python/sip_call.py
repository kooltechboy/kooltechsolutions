"""
KoolTech Solutions — Outbound SIP Caller
=========================================
Dials an external phone number via LiveKit SIP and drops the KoolTech
voice agent into the room so it can conduct the call.

Usage:
    python sip_call.py +18095551234 --room my-room --trunk YOUR_TRUNK_ID

Requirements:
    - LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in .env.local
    - A configured SIP outbound trunk on LiveKit Cloud (or LiveKit SIP trunk ID)

LiveKit SIP docs: https://docs.livekit.io/sip/
"""

import asyncio
import argparse
import os
import uuid
import logging

from dotenv import load_dotenv
from livekit.api import LiveKitAPI, CreateSIPParticipantRequest, AccessToken

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

logger = logging.getLogger("kooltech.sip")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

LIVEKIT_URL        = os.environ.get("LIVEKIT_URL", "")
LIVEKIT_API_KEY    = os.environ.get("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "")


async def make_outbound_call(
    phone_number: str,
    sip_trunk_id: str,
    room_name: str,
    display_name: str = "KoolTech Solutions",
    agent_name: str = "Kira",
) -> dict:
    """
    Dial a phone number via LiveKit SIP and inject the AI agent into the room.

    Args:
        phone_number:  E.164 phone number to call (e.g. '+18095551234').
        sip_trunk_id:  ID of the configured LiveKit outbound SIP trunk.
        room_name:     LiveKit room where the SIP participant will join.
        display_name:  Caller ID name shown to the recipient.
        agent_name:    Persona to load (Kira, Aria, Max, Cortex).

    Returns:
        dict with participant_id and room_name.
    """
    if not LIVEKIT_URL or not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise ValueError("LiveKit credentials not set in environment")

    logger.info(f"Initiating outbound call to {phone_number} via trunk {sip_trunk_id}")
    logger.info(f"Room: {room_name} | Persona: {agent_name}")

    api = LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    try:
        participant = await api.sip.create_sip_participant(
            CreateSIPParticipantRequest(
                sip_trunk_id=sip_trunk_id,
                sip_call_to=phone_number,
                room_name=room_name,
                participant_identity=f"sip-{phone_number.replace('+', '')}-{uuid.uuid4().hex[:6]}",
                participant_name=phone_number,
                participant_metadata=f'{{"agentName": "{agent_name}"}}',
                # Display name shown on PSTN caller ID
                play_ringtone=True,
                wait_until_answered=True,
            )
        )
        logger.info(f"SIP participant created: {participant.participant_identity}")
        return {
            "participant_id": participant.participant_identity,
            "room_name": room_name,
            "phone_number": phone_number,
        }
    finally:
        await api.aclose()


def main():
    parser = argparse.ArgumentParser(
        description="KoolTech Solutions — Outbound SIP Caller"
    )
    parser.add_argument("phone", help="Destination phone number in E.164 format (e.g. +18095551234)")
    parser.add_argument("--trunk", required=True, help="LiveKit SIP outbound trunk ID")
    parser.add_argument(
        "--room",
        default=f"outbound-{uuid.uuid4().hex[:8]}",
        help="LiveKit room name (auto-generated if omitted)"
    )
    parser.add_argument(
        "--persona",
        default="Kira",
        choices=["Kira", "Aria", "Max", "Cortex"],
        help="Agent persona to use for this call"
    )
    args = parser.parse_args()

    result = asyncio.run(
        make_outbound_call(
            phone_number=args.phone,
            sip_trunk_id=args.trunk,
            room_name=args.room,
            agent_name=args.persona,
        )
    )
    print(f"\n✅ Call initiated!")
    print(f"   Phone     : {result['phone_number']}")
    print(f"   Room      : {result['room_name']}")
    print(f"   Participant: {result['participant_id']}")
    print(f"\nThe AI agent will join the room automatically via LiveKit dispatch rules.")


if __name__ == "__main__":
    main()
