import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchFilters = async () => {
  const res = await axios.get(`${API_URL}/filters`);
  return res.data;
};

export const fetchOverview = async (params: any) => {
  const res = await axios.get(`${API_URL}/overview`, { params });
  return res.data;
};

export const fetchLabourData = async (params: any) => {
  const res = await axios.get(`${API_URL}/labour-data`, { params });
  return res.data;
};

export const fetchSkillDemand = async (params: any) => {
  const res = await axios.get(`${API_URL}/skill-demand`, { params });
  return res.data;
};

export const fetchForecast = async (skill: string) => {
  const res = await axios.get(`${API_URL}/forecast`, { params: { skill } });
  return res.data;
};

export const fetchGapAnalysis = async (params: any) => {
  const res = await axios.get(`${API_URL}/supply-demand-gap`, { params });
  return res.data;
};

export const fetchTraining = async (skill: string) => {
  const res = await axios.get(`${API_URL}/training-recommendations`, { params: { skill } });
  return res.data;
};

export const fetchGeoData = async (params: any) => {
  const res = await axios.get(`${API_URL}/geographic-intelligence`, { params });
  return res.data;
};
