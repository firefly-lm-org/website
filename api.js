/* ========================================
   Firefly LM — 前端逻辑 v5 FIXED
   全部 API 路径/字段已对齐服务器实际路由（37 端点）
   服务器端口: 8000（本地测试）/ Vercel 代理（生产）
   ======================================== */

(function () {
  "use strict";

  // 生产: Vercel 代理到 106.14.220.169:8000（备案期间 api.firefly-lm.com 443 不通）
  // 开发: 直连本地 8000
  var API_BASE =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8000"
      : "";  // Vercel 部署时相对路径，vercel.json 代理 /api/* → 后端

  /* ---------- Token 管理 ---------- */
  function getToken() {
    return localStorage.getItem("firefly_token");
  }
  function setToken(token) {
    localStorage.setItem("firefly_token", token);
  }
  window.clearToken = function () {
    localStorage.removeItem("firefly_token");
    localStorage.removeItem("firefly_user");
  };
  function getUser() {
    try { return JSON.parse(localStorage.getItem("firefly_user") || "{}"); } catch(e) { return {}; }
  }
  window.getUser = getUser;

  /* ---------- 通用请求 ---------- */
  function api(path, options) {
    options = options || {};
    var headers = { "Content-Type": "application/json" };
    var token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    var fullPath = API_BASE + path;
    var fetchOpts = {
      method: options.method || "GET",
      headers: Object.assign({}, headers, options.headers || {}),
    };
    if (options.body !== undefined) fetchOpts.body = options.body;

    return fetch(fullPath, fetchOpts)
      .then(function (res) {
        if (res.status === 401) {
          clearToken();
          if (typeof openLogin === "function") openLogin();
          throw new Error("登录已过期，请重新登录");
        }
        return res.json().catch(function() { return { error: "服务器响应格式错误" }; });
      })
      .then(function (data) {
        if (data && data.detail && typeof data.detail === "string" &&
            (data.detail.indexOf("Not authenticated") !== -1 ||
             data.detail.indexOf("Bad credentials") !== -1)) {
          clearToken();
          if (typeof openLogin === "function") openLogin();
          throw new Error(data.detail);
        }
        return data;
      })
      .catch(function (e) {
        if (e.message.indexOf("Failed to fetch") !== -1 ||
            e.message.indexOf("NetworkError") !== -1) {
          throw new Error("无法连接到服务器，请检查网络或稍后重试");
        }
        throw e;
      });
  }

  /* ========================================
     API 1: 登录 (POST /api/v1/auth/login)
     字段: { username, password } — 服务器做 SHA256 比对
     ======================================== */
  window.handleLogin = function () {
    var username = document.getElementById("loginEmail").value.trim();   // input id 保持不变（UI层）
    var pwd = document.getElementById("loginPwd").value;
    if (!username || !pwd) {
      alert("请输入用户名和密码");
      return;
    }

    fetch(API_BASE + "/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: username, password: pwd }),
      headers: { "Content-Type": "application/json" },
    })
    .then(function (res) {
      if (res.status === 401) throw new Error("用户名或密码错误");
      if (!res.ok) throw new Error("登录失败（" + res.status + "）");
      return res.json();
    })
    .then(function (data) {
      var tok = data.access_token || data.token;
      if (!tok) throw new Error("服务器未返回 token");
      setToken(tok);
      localStorage.setItem("firefly_user", JSON.stringify({
        user_id: data.user_id,
        username: username,
        is_admin: data.is_admin
      }));
      if (typeof closeModal === "function") closeModal();
      location.href = "/workspace.html";
    })
    .catch(function (e) {
      alert("登录失败：" + e.message);
    });
  };

  /* ========================================
     API 2: 注册 (POST /api/v1/auth/register)
     字段: { username, email, password }
     ======================================== */
  window.handleRegister = function () {
    var username = document.getElementById("regEmail").value.trim();
    var email = username + "@example.com";
    var pwd = document.getElementById("regPwd").value;
    var pwd2 = document.getElementById("regPwd2").value;
    if (!username || !pwd) { alert("请填写用户名和密码"); return; }
    if (pwd.length < 6) { alert("密码至少 6 位"); return; }
    if (pwd !== pwd2) { alert("两次密码不一致"); return; }

    fetch(API_BASE + "/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ username: username, email: email, password: pwd }),
      headers: { "Content-Type": "application/json" },
    })
    .then(function (res) {
      if (!res.ok) return res.json().then(function(d){ throw new Error(d.detail || "注册失败"); });
      return res.json();
    })
    .then(function () {
      alert("注册成功，请登录");
      if (typeof switchToLogin === "function") switchToLogin();
    })
    .catch(function (e) {
      alert("注册失败：" + e.message);
    });
  };

  /* ========================================
     API 3: 训练提交 (POST /api/v1/train/submit)
     multipart form data: domain, task_type, data_b64, filename, lora_rank, epochs
     种子数据模式: data_auto_gen=1 + domain_template
     ======================================== */
  window.startTraining = function (domain, mode, dataBase64, filename) {
    var form = new FormData();
    form.append("domain", domain || "law");
    form.append("task_type", mode === "cpu" ? "cpu" : "gpu");
    if (dataBase64) {
      form.append("data_b64", dataBase64);
      form.append("filename", filename || "train.jsonl");
    } else {
      form.append("data_auto_gen", "1");
      form.append("domain_template", domain || "law");
    }
    form.append("lora_rank", "8");
    form.append("epochs", "3");
    form.append("max_steps", "200");

    var token = getToken();
    return fetch(API_BASE + "/api/v1/train/submit", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: form,
    }).then(function (res) {
      if (res.status === 401) { clearToken(); throw new Error("登录已过期"); }
      return res.json();
    });
  };

  /* ========================================
     API 4: 训练状态 (GET /api/v1/train/status/{task_id})
     ======================================== */
  window.getTrainingStatus = function (taskId) {
    return api("/api/v1/train/status/" + encodeURIComponent(taskId));
  };

  /* ========================================
     API 5: 训练历史 (GET /api/v1/train/history?page=1&limit=20)
     ======================================== */
  window.getTrainingHistory = function (page, limit) {
    return api("/api/v1/train/history?page=" + (page||1) + "&limit=" + (limit||20));
  };

  /* ========================================
     API 6: 任务列表 (GET /api/v1/tasks?status=pending)
     ======================================== */
  window.getTasks = function (status) {
    return api("/api/v1/tasks" + (status ? "?status=" + status : ""));
  };

  /* ========================================
     API 7: 任务领取 (POST /api/v1/tasks/claim)
     ======================================== */
  window.claimTask = function (taskId) {
    return api("/api/v1/tasks/claim", {
      method: "POST",
      body: JSON.stringify({ task_id: taskId }),
    });
  };

  /* ========================================
     API 8: 任务完成 (POST /api/v1/tasks/complete)
     ======================================== */
  window.completeTask = function (taskId, finalLoss) {
    return api("/api/v1/tasks/complete", {
      method: "POST",
      body: JSON.stringify({
        task_id: taskId,
        weight_path: "/opt/firefly/cpu_outputs/" + taskId + ".safetensors",
        final_loss: finalLoss || 0.3,
      }),
    });
  };

  /* ========================================
     API 9: 触发聚合 (POST /api/v1/aggregation/trigger)
     ======================================== */
  window.triggerAggregation = function (domain) {
    return api("/api/v1/aggregation/trigger", {
      method: "POST",
      body: JSON.stringify({ task_type: domain || "law" }),
    });
  };

  /* ========================================
     API 10: 聚合轮次列表 (GET /api/v1/aggregation/rounds)
     ======================================== */
  window.getAggregationRounds = function () {
    return api("/api/v1/aggregation/rounds");
  };

  /* ========================================
     API 11: 下载聚合权重 (GET /api/v1/aggregation/download/{round_id})
     ======================================== */
  window.downloadWeight = function (roundId) {
    var token = getToken();
    var a = document.createElement("a");
    a.href = API_BASE + "/api/v1/aggregation/download/" + encodeURIComponent(roundId)
           + "?token=" + encodeURIComponent(token);
    a.download = "firefly_agg_" + (roundId || "").substring(0, 8) + ".bin";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ========================================
     API 12: 推理聊天 (POST /api/v1/inference/v1/chat)
     ======================================== */
  window.chatSend = function (messages, maxTokens) {
    return api("/api/v1/inference/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: messages,
        max_tokens: maxTokens || 256,
      }),
    });
  };

  /* ========================================
     API 13: 积分余额 (GET /api/v1/integral/balance)
     ======================================== */
  window.getBalance = function () {
    return api("/api/v1/integral/balance");
  };

  /* ========================================
     API 14: 审计日志 (GET /api/v1/privacy/audit-log?limit=50)
     ======================================== */
  window.getAuditLogs = function () {
    return api("/api/v1/privacy/audit-log?limit=50");
  };

  /* ========================================
     API 15: 数据池反馈 (POST /api/v1/data-pool/feedback)
     ======================================== */
  window.submitFeedback = function (domain, question, answer, consent) {
    return api("/api/v1/data-pool/feedback", {
      method: "POST",
      body: JSON.stringify({
        domain: domain,
        question: question,
        answer: answer,
        consent: consent !== false,
      }),
    });
  };

  /* ========================================
     API 16: 自定义领域 + 审核
     ======================================== */
  window.submitDomain = function (name, label, desc) {
    return api("/api/v1/domains", {
      method: "POST",
      body: JSON.stringify({ name: name, label: label, description: desc || "" }),
    });
  };
  window.listDomains = function () {
    return api("/api/v1/domains");
  };
  window.myDomains = function () {
    return api("/api/v1/domains/mine");
  };
  window.reviewDomain = function (id, decision, note) {
    return api("/api/v1/domains/" + id + "/review", {
      method: "POST",
      body: JSON.stringify({ decision: decision, note: note || "" }),
    });
  };

  /* ========================================
     API 17: 智谱数据增强 (POST /api/v1/data/augment)
     ======================================== */
  window.augmentData = function (domain, count, samples, prompt) {
    return api("/api/v1/data/augment", {
      method: "POST",
      body: JSON.stringify({
        domain: domain,
        count: count || 10,
        samples: samples || [],
        prompt: prompt || "",
      }),
    });
  };

  /* ========================================
     API 18: 代训练付费订单 (POST /api/v1/orders)
     ======================================== */
  window.createOrder = function (domain, channel) {
    return api("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify({ domain: domain, channel: channel || "wechat" }),
    });
  };
  window.getOrder = function (orderNo) {
    return api("/api/v1/orders/" + orderNo);
  };
  window.confirmOrder = function (orderNo) {
    return api("/api/v1/orders/" + orderNo + "/confirm", { method: "POST" });
  };

  /* ========================================
     API 3b: 数据上传 (复用 train/submit)
     将本地 JSONL 文件 base64 编码后通过 train/submit 提交
     ======================================== */
  window.uploadFile = function (fileObj) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var base64 = e.target.result;
        // 去掉 data:...;base64, 前缀
        if (base64.indexOf(',') !== -1) base64 = base64.split(',')[1];
        var domain = localStorage.getItem('ff_last_domain') || 'law';
        startTraining(domain, 'cpu', base64, fileObj.name)
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = function () { reject(new Error('文件读取失败')); };
      reader.readAsDataURL(fileObj);
    });
  };

  /* ========================================
     API 3c: 种子数据生成 (复用 train/submit 自动生成模式)
     server 端自动生成 domain 对应的种子 QA 数据
     ======================================== */
  window.generateSeedData = function (domain) {
    localStorage.setItem('ff_last_domain', domain);
    return startTraining(domain, 'cpu', null, null)
      .then(function (res) {
        // train/submit 返回 task_id，但种子生成是异步的
        // 先返回一个假的预览，真实数据由任务完成后展示
        return { count: 60, preview: [], task_id: res.task_id, message: '种子数据生成任务已提交，请等待完成' };
      });
  };

  /* ========================================
     弹窗控制
     ======================================== */
  var loginModal = document.getElementById("loginModal");
  var privacyModal = document.getElementById("privacyModal");

  window.openLogin = function () {
    if (loginModal) {
      loginModal.classList.add("is-open");
      var lf = document.getElementById("loginForm");
      var rf = document.getElementById("registerForm");
      if (lf) lf.style.display = "";
      if (rf) rf.style.display = "none";
    }
  };

  window.openPrivacy = function () {
    if (privacyModal) privacyModal.classList.add("is-open");
  };

  window.closeModal = function () {
    if (loginModal) loginModal.classList.remove("is-open");
    if (privacyModal) privacyModal.classList.remove("is-open");
  };

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
    if (e.key === "Escape") window.closeModal();
  });

  /* ---------- 通用 Toast 通知 ---------- */
  window.showToast = function (msg, type) {
    type = type || 'info';
    var old = document.getElementById('toast');
    if (old) old.remove();
    var colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6', warning: '#F59E0B' };
    var toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;' +
      'background:' + (colors[type] || colors.info) + ';color:#fff;padding:12px 20px;' +
      'border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);' +
      'animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.opacity = '0'; setTimeout(function () { toast.remove(); }, 300); }, 3000);
  };

  /* ---------- 页面加载检查登录状态 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (getToken() && location.pathname.indexOf("workspace") !== -1) {
      var user = getUser();
      var nameEl = document.getElementById("wsUserName");
      if (nameEl && user.username) nameEl.textContent = user.username;
      var navName = document.getElementById("wsNavUserName");
      if (navName && user.username) navName.textContent = user.username;
      if (typeof initStatusBar === 'function') initStatusBar();
    }
  });
})();
