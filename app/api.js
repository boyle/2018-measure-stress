const host = "https://saans.ca/api/v1";

export default {
  getSessionId: async patientId => {
    const resp = await fetch(`${host}/p/${patientId}`, {
      credentials: "same-origin"
    });
    const list = await resp.text();
    const sessions = list.split("<br/>");
    sessions.sort();
    return parseInt(sessions[sessions.length - 1]) + 1;
  },
  putSession: async (patientId, session) => {
    return await fetch(
      `${host}/p/${patientId}/${session.sessionId}/annotations.json`,
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
    const resp = await fetch(`${host}/p`, {
      credentials: "same-origin"
    });
    const list = await resp.text();
    const patients = list.split("<br/>");
    patients.sort();
    return patients;
  }
};
