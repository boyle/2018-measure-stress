const api = "https://saans.ca/api/v1";
const host = "https://saans.ca/";

export default {
	getAppVersion: async () => {
		const resp = await fetch(`${api}/ver/app`, {
      credentials: "same-origin",
    });
	  return await resp.text();
	},
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
  getSessionsList: async patientId => {
    try {
      const resp = await fetch(`${api}/p/${patientId}`, {
        credentials: "same-origin"
      });
      const list = await resp.text();
      const sessions = list.split("<br/>");
      sessions.sort();
      return sessions;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getSession: async (patientId, sessionId) => {
    console.log(`${api}/p/${patientId}/${sessionId}/annotations.json`);
    try {
      const resp = await fetch(
        `${api}/p/${patientId}/${sessionId}/annotations.json`,
        {
          credentials: "same-origin"
        }
      );
      const session = await resp.json();
      return session;
    } catch (err) {
      console.log("here");
      console.log(err);
      throw err;
    }
  },
  putSession: async session => {
    return await fetch(
      `${api}/p/${session.patientId}/${session.sessionId}/annotations.json`,
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
