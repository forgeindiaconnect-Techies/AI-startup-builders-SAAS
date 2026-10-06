import { API_URL } from '../config/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ai_startup_builder_jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchFounderDataRoom(startupId: string) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch data room');
  return data.data;
}

export async function fetchInvestorAccessibleDataRooms(investorId: string) {
  const res = await fetch(`${API_URL}/dataroom/investor/accessible?investorId=${encodeURIComponent(investorId)}`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch investor data rooms');
  return data.data;
}

export async function addDataRoomDocument(startupId: string, docPayload: any) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(docPayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to add document');
  return data.data;
}

export async function updateDataRoomDocument(startupId: string, docId: string, updatePayload: any) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updatePayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update document');
  return data.data;
}

export async function manageInvestorDataRoomAccess(startupId: string, accessPayload: any) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(accessPayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to manage access');
  return data.data;
}

export async function submitDataRoomQA(startupId: string, qaPayload: any) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(qaPayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit QA');
  return data.data;
}

export async function logDataRoomActivity(startupId: string, logPayload: any) {
  const res = await fetch(`${API_URL}/dataroom/startup/${startupId}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(logPayload),
  });
  const data = await res.json();
  return data.data;
}

export async function fetchAllDataRoomsAdmin() {
  const res = await fetch(`${API_URL}/dataroom/admin/all`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch admin data rooms');
  return data.data;
}
