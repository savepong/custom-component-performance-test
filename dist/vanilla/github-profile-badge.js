class GithubProfileBadge extends HTMLElement { constructor() { super() } connectedCallback() { let e = this.getAttribute("username"); e && (this.renderTemplate(e), setTimeout(() => { this.updateTemplate("GoogleChromeLabs") }, 1e4)) } async renderTemplate(e) { let t = await this.fetchProfile(e); performance.mark("create-component-mark-start"); let r = this.createTemplate(t); this.innerHTML = r, performance.mark("create-component-mark-end"), performance.measure("create-component-mark", "create-component-mark-start", "create-component-mark-end"); let a = performance.getEntriesByName("create-component-mark"); performance.clearMarks(), performance.clearMeasures(), console.log(`Create Component ${a[0].duration.toFixed(2)}`) } async fetchProfile(e) { let t = await fetch(`https://api.github.com/users/${e}?client_id=debcd7873f058b255df6&client_secret=68daf6582e66220cac4e6fc555e62ee90c23d815`), r = await t.json(); return { username: r.login, url: r.html_url, repos: r.public_repos, followers: r.followers, following: r.following, location: r.location, avatarUrl: r.avatar_url } } async updateTemplate(e) { let t = await this.fetchProfile(e); performance.mark("update-component-mark-start"), this.querySelectorAll("#avatar")[0].setAttribute("title", t.name), this.querySelectorAll("#avatar")[0].setAttribute("href", t.url), this.querySelectorAll("#avatar > img")[0].setAttribute("src", t.avatarUrl), this.querySelectorAll("#avatar > img")[0].setAttribute("alt", t.username), this.querySelectorAll("h2 > a")[0].setAttribute("href", t.url), this.querySelectorAll("h2 > a")[0].setAttribute("title", t.url), this.querySelectorAll("h2 > a")[0].innerHTML = `@${t.username}`, this.querySelectorAll("h3")[0].innerHTML = t.location || "", this.querySelectorAll("#follower-container")[0].setAttribute("href", t.url), this.querySelectorAll("#follower-container > i").innerHTML = t.followers, this.querySelectorAll("#repos-container")[0].setAttribute("href", t.url), this.querySelectorAll("#repos-container > i").innerHTML = t.followers, this.querySelectorAll("#following-container")[0].setAttribute("href", t.url), this.querySelectorAll("#following-container > i").innerHTML = t.followers, performance.mark("update-component-mark-end"), performance.measure("update-component-mark", "update-component-mark-start", "update-component-mark-end"); let r = performance.getEntriesByName("update-component-mark"); performance.clearMarks(), performance.clearMeasures(), console.log(`Update Component ${r[0].duration.toFixed(2)}`) } createTemplate(e) { return `\n            <section id="github--profile">\n                <div id="github--profile__info">\n                    <a href="${e.url}" target="_blank" title="${e.name}" id="avatar">\n                        <img src="${e.avatarUrl}" alt="${e.username}"/>\n                    </a>\n                    <h2>\n                        <a href="${e.url}" title="${e.username}" target="_blank">@${e.username}</a>\n                    </h2>\n                    <h3>${e.location || ""}</h3>\n                </div>\n                <div id="github--profile__state">\n                    <ul>\n                        <li>\n                            <a href="${e.url}" target="_blank" id="follower-container" title="Number Of Followers">\n                                <i>${e.followers}</i>\n                                <span>Followers</span>\n                            </a>\n                        </li>\n                        <li>\n                            <a href="${e.url}" target="_blank" id="repos-container" title="Number Of Repositoriy">\n                                <i>${e.repos}</i>\n                                <span>Repositoriy</span>\n                            </a>\n                        </li>\n                        <li>\n                            <a href="${e.url}" target="_blank" id="following-container" title="Number Of Following">\n                                <i>${e.following}</i>\n                                <span>Following</span>\n                            </a>\n                        </li>\n                    </ul>\n                </div>\n            </section>` } } customElements.define("github-profile-badge", GithubProfileBadge);