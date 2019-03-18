const api = "https://saans.ca/api/v1";
const host = "https://saans.ca/";

export default {
  login: async (username, password) => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    return fetch(`${host}/auth/login`, {
      credentials: "same-origin",
      method: "post",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3"
      },
      body: form
    });
  },
  createPatient: async patientId => {
    return await fetch(`${api}/p/${patientId}`, {
      credentials: "same-origin",
      method: "PUT"
    });
  },
  getSessionId: async patientId => {
    const resp = await fetch(`${api}/p/${patientId}`, {
      credentials: "same-origin"
    });
    const list = await resp.text();
    const sessions = list.split("<br/>");
    if (sessions[0] === "") return 1; // API returns what eventually gives this array [""] for a new patient
    sessions.sort();
    return parseInt(sessions[sessions.length - 1]) + 1;
  },
  getSessionsList: async patientId => {
    const resp = await fetch(`${api}/p/${patientId}`, {
      credentials: "same-origin"
    });
    const list = await resp.text();
    const sessions = list.split("<br/>");
    sessions.sort();
    return sessions;
  },
  putSession: async (patientId, session) => {
    return await fetch(
      `${api}/p/${patientId}/${session.sessionId}/annotations.json`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        method: "PUT",
        body: JSON.stringify(session)
      }
    );
  },
  getPatientsList: async () => {
    const resp = await fetch(`${api}/p`, {
      credentials: "same-origin"
    });
    const list = await resp.text();
    const patients = list.split("<br/>");
    patients.sort();
    return patients;
  }
};
