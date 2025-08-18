'use server';

import { MaintenanceRequest, HostelName } from './types';

let requests: MaintenanceRequest[] = [
  {
    id: 'REQ-001',
    name: 'Suresh Kumar',
    registerNumber: 'URK20CS1120',
    hostelName: 'Podhigai',
    floor: '1',
    roomNumber: '101',
    category: 'Plumbing',
    priority: 'High',
    description: 'Leaky faucet in the bathroom, dripping constantly.',
    status: 'Submitted',
    createdDate: new Date('2024-07-20T09:00:00Z'),
    urgency: 'medium',
  },
  {
    id: 'REQ-002',
    name: 'Priya Sharma',
    registerNumber: 'URK20EC1121',
    hostelName: 'Vaigai',
    floor: '2',
    roomNumber: '205',
    category: 'Electrical',
    priority: 'High',
    description: 'Main room light is flickering. Possible short circuit.',
    status: 'In Progress',
    createdDate: new Date('2024-07-20T11:30:00Z'),
    urgency: 'high',
  },
  {
    id: 'REQ-003',
    name: 'Anil Gupta',
    registerNumber: 'URK20ME1122',
    hostelName: 'Thamirabarani',
    floor: '3',
    roomNumber: '310',
    category: 'AC',
    priority: 'Medium',
    description: 'AC is not cooling effectively.',
    status: 'Submitted',
    createdDate: new Date('2024-07-21T14:00:00Z'),
    urgency: 'low',
  },
  {
    id: 'REQ-004',
    name: 'Suresh Kumar',
    registerNumber: 'URK20CS1120',
    hostelName: 'Podhigai',
    floor: '1',
    roomNumber: '101',
    category: 'Plumbing',
    priority: 'High',
    description: 'The faucet in my bathroom is leaking.',
    status: 'Submitted',
    createdDate: new Date('2024-07-21T15:00:00Z'),
    urgency: 'medium',
    isDuplicate: true,
  },
  {
    id: 'REQ-005',
    name: 'Deepa Iyer',
    registerNumber: 'URK20IT1123',
    hostelName: 'Kaveri',
    floor: '4',
    roomNumber: '415',
    category: 'Furniture',
    priority: 'Low',
    description: 'The desk chair has a broken wheel.',
    status: 'Resolved',
    createdDate: new Date('2024-07-19T10:00:00Z'),
    urgency: 'low',
  },
  {
    id: 'REQ-006',
    name: 'Vijay Singh',
    registerNumber: 'URK20CE1124',
    hostelName: 'Amaravathi',
    floor: 'G',
    roomNumber: 'G-Lobby',
    category: 'Lift',
    priority: 'High',
    description: 'The main elevator is making strange noises and got stuck between floors.',
    status: 'Submitted',
    createdDate: new Date('2024-07-22T08:00:00Z'),
    urgency: 'critical',
  },
  {
    id: 'REQ-007',
    name: 'Ravi Verma',
    registerNumber: 'URK20EE1125',
    hostelName: 'Podhigai',
    floor: '2',
    roomNumber: '220',
    category: 'Electrical',
    priority: 'High',
    description: 'I saw sparks from the power outlet near my bed.',
    status: 'Submitted',
    createdDate: new Date('2024-07-22T09:15:00Z'),
    urgency: 'critical',
  },
];

export async function getRequests(filters?: { hostelName?: HostelName, floor?: string }): Promise<MaintenanceRequest[]> {
  // In a real app, you'd fetch this from a database with proper filtering.
  let filteredRequests = requests;

  if (filters?.hostelName) {
    filteredRequests = filteredRequests.filter(r => r.hostelName === filters.hostelName);
  }

  if (filters?.floor) {
    filteredRequests = filteredRequests.filter(r => r.floor === filters.floor);
  }

  // Sorting by date descending to show newest first.
  return Promise.resolve(filteredRequests.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime()));
}

export async function addRequest(request: Omit<MaintenanceRequest, 'id' | 'createdDate'>) {
  // In a real app, you'd insert this into a database.
  const newRequest: MaintenanceRequest = {
    ...request,
    id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
    createdDate: new Date(),
  };
  requests.push(newRequest);
  return Promise.resolve(newRequest);
}
