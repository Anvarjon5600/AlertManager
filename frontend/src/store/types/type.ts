export type UsersType = {
	email: string,
	id: number,
	name: string,
  password: string,
  image: string,
}


export type State = {
	user: {
    users: UsersType[],
	},
}

export interface NutanixConfig {
  vip: string;
  username: string;
  password: string;
  smtpServer: string;
  smtpPort: number;
  smtpSender: string;
  smtpPassword: string;
  smtpReceiver: string;
  geminiApiKey: string;
}

export interface Alert {
  message: string;
  time: number;
  categories: string;
  severity: string;
  gemini_rec?: string;
  id: string;
}

export interface NutanixState {
  config: NutanixConfig;
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

export interface FetchAlertsParams {
  vip: string;
  username: string;
  password: string;
}

export interface XClarityAlert {
  alertID: string;
  args: any[];
  bayText: string;
  chassisText: string;
  commonEventID: string;
  componentID: string;
  componentIdentifierText: string;
  eventClass: number;
  eventDate: string;
  eventID: string;
  eventSourceText: string;
  failFRUNames: any[];
  failFRUPartNumbers: any[];
  failFRUUUIDs: any[];
  failFRUs: any[];
  failSNs: any[];
  flags: string;
  fruSerialNumberText: string;
  groupName: string[];
  groupUUID: any[];
  isManagement: boolean;
  location: string;
  msg: string;
  msgID: string;
  raisedDate: string;
  relatedAlerts: string;
  service: number;
  serviceabilityText: string;
  severity: number;
  severityText: string;
  sourceID: string;
  systemFruNumberText: string;
  systemName: string;
  systemSerialNumberText: string;
  systemText: string;
  systemTypeModelText: string;
  systemTypeText: string;
  typeText: string;
}

export interface XClarityConfig {
  host: string;
  username: string;
  password: string;
}

export interface XClarityState {
  alerts: XClarityAlert[];
  config: XClarityConfig;
  loading: boolean;
  error: string | null;
}
