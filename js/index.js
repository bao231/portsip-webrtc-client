window.onload = function () {
  console.log("window load");

  const register = getElement("register");
  register.addEventListener("click", () => {
    createUser({
      wsServer: getElement("server").value,
      domain: getElement("domain").value,
      username: getElement("username").value,
      password: getElement("password").value,
    })
      .then(() => alert("send register success"))
      .catch((e) => alert(e.msg));
  });

  /** single UA function below */
  const call = getElement("call");
  call.addEventListener("click", () => {
    errorCheck().then(() => {
      const target = getElement("target");
      const domain = getElement("domain");
      const targetURI = `sip:${target.value}@${domain.value}`;
      window.SimpleUser.call(targetURI).catch((e) => {
        alert(`Is there have a correct target? (${e})`);
      });
    });
  });

  const hangup = getElement("hangup");
  hangup.addEventListener("click", () => {
    errorCheck().then(() => {
      window.SimpleUser.hangup();
    });
  });

  const hold = getElement("hold");
  hold.addEventListener("click", () => {
    errorCheck().then(() => {
      window.SimpleUser.hold();
    });
  });

  const unhold = getElement("unhold");
  unhold.addEventListener("click", () => {
    errorCheck().then(() => {
      window.SimpleUser.unhold();
    });
  });

  const message = getElement("msg");
  message.addEventListener("click", () => {
    errorCheck().then(() => {
      const target = getElement("target");
      const domain = getElement("domain");
      const targetURI = `sip:${target.value}@${domain.value}`;

      let text = getElement("messageText").value;
      window.SimpleUser.message(targetURI, text)
        .then(() => {
          alert("send success");
        })
        .catch((e) => {
          alert(`Is there have a correct target? ${e}`);
        });
    });
  });
};

/**
 * create UserAgent
 * @param {object} param
 * @param {string} param.wsServer
 * @param {string} param.domain
 * @param {string} param.username
 * @param {string} param.password
 * @param {number} param.expires register expire time, unit: second
 */
async function createUser({ wsServer, domain, username, password, expires = 600 }) {
  const options = {
    aor: `sip:${username}@${domain}`,
    delegate: {
      onMessageReceived(msg) {
        alert(`receive message : ${msg}`);
      },
      onCallAnswered() {},
      async onCallReceived() {
        await window.SimpleUser.answer()
          .then(() => {
            console.log(`${username} answered`);
          })
          .catch((e) => console.error("answer error: ", e));
      },
      onCallHangup() {},
      onCallHold(held) {
        if (held) {
        } else {
        }
      },
    },
    media: {
      constraints: {
        audio: true,
        video: true,
      },
      local: {
        video: getElement("local") || local,
      },
      remote: {
        video: getElement("remote") || remote,
      },
    },
    userAgentOptions: {
      authorizationUsername: username,
      authorizationPassword: password,
      logLevel: "error",
      displayName: username,
    },
  };
  const SimpleUser = new window.SIP.Web.SimpleUser(wsServer, options);
  window.SimpleUser = SimpleUser;
  try {
    await SimpleUser.connect();
    await SimpleUser.register({ expires });
    return Promise.resolve(username);
  } catch (error) {
    return Promise.reject({ username, msg: error.message, stack: error.stack });
  }
}

// helper
function errorCheck() {
  if (window.SimpleUser) return Promise.resolve();
  else {
    alert("User not exist, register again");
    return Promise.reject();
  }
}

function getElement(id) {
  const element = document.querySelector("#" + id);
  return element;
}

function disableDom(element) {
  element.disabled = true;
}

function enableDom(element) {
  element.disabled = false;
}
