import { Meeting, MeetingType } from '@/lib/types'

interface MeetingFormData {
  title: string
  scheduled_at: string
  attendees: string
  location_or_link: string
  meeting_type: MeetingType
}

export const initialFormData: MeetingFormData = {
  title: '',
  scheduled_at: '',
  attendees: '',
  location_or_link: '',
  meeting_type: '项目推进',
}

export const MEETING_TYPES: MeetingType[] = ['项目推进', '客户拜访', '周例会', '其他']
