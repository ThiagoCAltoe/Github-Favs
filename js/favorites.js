import { GithubUser } from "./githubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username)

      if (userExists) {
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onadd()
  }

  onadd() {
    const inputField = this.root.querySelector(".search input")
    const addButton = this.root.querySelector(".search button")

    inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.add(inputField.value)
      }
    })

    addButton.onclick = () => {
      this.add(inputField.value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`
      this.tbody.append(row)
      row.querySelector(".user img").alt = `Imagem de ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certez que deseja deletar essa linha?")
        if (isOk) {
          this.delete(user)
        }
      }
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    const content = `
          <td class="user">
            <img src="" alt="">
            <a href="" target="_blank">
              <p></p>
              <span></span>
            </a>
          </td>
          <td class="repositories"></td>
          <td class="followers"></td>
          <td>
            <button class="remove">&times;</button>
          </td>
    `
    tr.innerHTML = content

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
