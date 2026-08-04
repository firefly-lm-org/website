/* ========================================
   Firefly LM — 前端逻辑 v5
   - 弹窗控制（登录/注册/隐私）
   - 完整 API 封装（12 个接口）
   - Token 管理
   ======================================== */

(function () {
  "use strict";

  var API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://106.14.220.169:8080"
      : "https://api.firefly-lm.com";

  /* ---------- Token 管理 ---------- */
  function getToken() {
    return localStorage.getItem("firefly_token");
  }
  function setToken(token) {
    localStorage.setItem("firefly_token", token);
  }
  function clearToken() {
    localStorage.removeItem("firefly_token");
  }
  function authHeaders() {
    var headers = { "Content-Type": "application/json" };
    var token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
    return headers;
  }

  /* ---------- 通用请求 ---------- */
  async function api(path, options) {
    options = options || {};
    try {
      var res = await fetch(API_BASE + path, {
        method: options.method || "GET",
        body: options.body,
        headers: Object.assign({}, authHeaders(), options.headers || {}),
      });
      if (res.status === 401) {
        clearToken();
        openLogin();
        throw new Error("登录已过期，请重新登录");
      }
      return res.json();
    } catch (e) {
      if (e.message.includes("Failed to fetch")) {
        throw new Error("无法连接到服务器，请检查网络或稍后重试");
      }
      throw e;
    }
  }

  /* ========================================
     API 1: 登录
     ======================================== */
  window.handleLogin = async function () {
    var email = document.getElementById("loginEmail").value.trim();
    var pwd = document.getElementById("loginPwd").value;
    if (!email || !pwd) {
      alert("请输入邮箱和密码");
      return;
    }
    try {
      var data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: pwd }),
      });
      var token = data.access_token || data.token;
      if (token) {
        setToken(token);
        closeModal();
        location.href = "/workspace.html";
      } else {
        alert("登录失败：未返回 token");
      }
    } catch (e) {
      alert("登录失败：" + e.message);
    }
  };

  /* ========================================
     API 2: 注册
     ======================================== */
  window.handleRegister = async function () {
    var email = document.getElementById("regEmail").value.trim();
    var pwd = document.getElementById("regPwd").value;
    var pwd2 = document.getElementById("regPwd2").value;
    if (!email || !pwd) {
      alert("请输入邮箱和密码");
      return;
    }
    if (pwd.length < 8) {
      alert("密码至少 8 位");
      return;
    }
    if (pwd !== pwd2) {
      alert("两次密码不一致");
      return;
    }
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: email, password: pwd }),
      });
      alert("注册成功，请登录");
      switchToLogin();
    } catch (e) {
      alert("注册失败：" + e.message);
    }
  };

  /* ========================================
     API 3: 数据上传
     ======================================== */
  window.uploadFile = async function (file) {
    var formData = new FormData();
    formData.append("file", file);
    var res = await fetch(API_BASE + "/api/v1/data/upload", {
      method: "POST",
      headers: { Authorization: "Bearer " + getToken() },
      body: formData,
    });
    return res.json();
  };

  /* ========================================
     API 4: 种子数据生成
     ======================================== */
  window.generateSeedData = async function (domain) {
    return api("/api/v1/data/generate", {
      method: "POST",
      body: JSON.stringify({ domain: domain }),
    });
  };

  /* ========================================
     API 5: 启动训练
     ======================================== */
  window.startTraining = async function (domain, mode) {
    return api("/api/v1/training/start", {
      method: "POST",
      body: JSON.stringify({ domain: domain, mode: mode }),
    });
  };

  /* ========================================
     API 6: 查询训练状态
     ======================================== */
  window.getTrainingStatus = async function (taskId) {
    return api("/api/v1/training/status?id=" + taskId);
  };

  /* ========================================
     API 7: 触发聚合
     ======================================== */
  window.triggerAggregation = async function (domain) {
    return api("/api/v1/federation/aggregate", {
      method: "POST",
      body: JSON.stringify({ domain: domain }),
    });
  };

  /* ========================================
     API 8: 下载权重
     ======================================== */
  window.downloadWeight = function (roundId) {
    var token = getToken();
    var a = document.createElement("a");
    a.href = API_BASE + "/api/v1/aggregation/download/" + roundId + "?token=" + token;
    a.download = "firefly_weight_" + roundId + ".bin";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ========================================
     API 9: 推理聊天
     ======================================== */
  window.chatSend = async function (messages, adapterId) {
    var body = { messages: messages };
    if (adapterId) body.adapter_id = adapterId;
    return api("/api/v1/inference/v1/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  /* ========================================
     API 10: 查询积分
     ======================================== */
  window.getBalance = async function () {
    return api("/api/v1/integral/balance");
  };

  /* ========================================
     API 11: 数据池反馈
     ======================================== */
  window.submitFeedback = async function (domain, question, answer, consent) {
    return api("/api/v1/data-pool/feedback", {
      method: "POST",
      body: JSON.stringify({
        domain: domain,
        question: question,
        answer: answer,
        consent: consent,
      }),
    });
  };

  /* ========================================
     API 12: 审计日志
     ======================================== */
  window.getAuditLogs = async function () {
    return api("/api/v1/privacy/audit-log");
  };

  /* ========================================
     弹窗控制
     ======================================== */
  var loginModal = document.getElementById("loginModal");
  var privacyModal = document.getElementById("privacyModal");

  window.openLogin = function () {
    closeAllModals();
    if (loginModal) {
      loginModal.classList.add("is-open");
      var lf = document.getElementById("loginForm");
      var rf = document.getElementById("registerForm");
      if (lf) lf.style.display = "";
      if (rf) rf.style.display = "none";
    }
  };

  window.openPrivacy = function () {
    closeAllModals();
    if (privacyModal) privacyModal.classList.add("is-open");
  };

  window.closeModal = function () {
    closeAllModals();
  };

  function closeAllModals() {
    if (loginModal) loginModal.classList.remove("is-open");
    if (privacyModal) privacyModal.classList.remove("is-open");
  }

  window.switchToRegister = function () {
    var lf = document.getElementById("loginForm");
    var rf = document.getElementById("registerForm");
    if (lf) lf.style.display = "none";
    if (rf) rf.style.display = "";
  };

  window.switchToLogin = function () {
    var lf = document.getElementById("loginForm");
    var rf = document.getElementById("registerForm");
    if (lf) lf.style.display = "";
    if (rf) rf.style.display = "none";
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllModals();
  });

  /* ---------- 页面加载检查登录状态 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (getToken() && location.pathname.includes("workspace")) {
      console.log("[Firefly] Logged in, loading workspace...");
    }
  });
})();
