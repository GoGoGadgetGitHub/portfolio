import farRight from "../../assets/farright.svg";
import farLeft from "../../assets/farleft.svg";
import left from "../../assets/left.svg";
import right from "../../assets/right.svg";

export class Pagination {
  constructor(maxPages) {
    this.maxPages = maxPages;
    this.setup();

    this.moved = new Event("moved");

    this.addEventListenters();

    if (maxPages < 5) {
      this.pointer = maxPages;
    } else {
      this.pointer = 4;
    }

    this.pageNumbers(maxPages);
    this.drawPages();
  }

  addEventListenters() {
    this.left.addEventListener("click", () => {
      this.move(false);
      this.drawPages();
      document.dispatchEvent(this.moved);
    });
    this.right.addEventListener("click", () => {
      this.move(true);
      this.drawPages();
      document.dispatchEvent(this.moved);
    });

    this.farLeft.addEventListener("click", () => this.begin());
    this.farRight.addEventListener("click", () => this.end());

    for (const page of this.pages) {
      page.page.addEventListener("click", (event) => {
        this.numberClicked(event);
        this.drawPages();
        document.dispatchEvent(this.moved);
      });
    }
  }

  setup() {
    this.pages = this.makePages();
    this.pagesDiv = document.createElement("div");

    for (const page of this.pages) {
      this.pagesDiv.appendChild(page.page);
    }

    this.left = document.createElement("div").appendChild(
      document.createElement("img"),
    );
    this.left.src = left;

    this.right = document.createElement("div").appendChild(
      document.createElement("img"),
    );
    this.right.src = right;

    this.farLeft = document.createElement("div").appendChild(
      document.createElement("img"),
    );
    this.farLeft.src = farLeft;

    this.farRight = document.createElement("div").appendChild(
      document.createElement("img"),
    );
    this.farRight.src = farRight;

    this.node = document.createElement("div");
    this.node.appendChild(this.farLeft);
    this.node.appendChild(this.left);
    this.node.appendChild(this.pagesDiv);
    this.node.appendChild(this.right);
    this.node.appendChild(this.farRight);
    this.node.classList.add("pagination");
    this.node.id = "pagination";

    //case of less then 6 pages
    //fill the page this.pages.nodes needed and hide the rest of the pages
  }

  numberClicked(event) {
    const selectedPage = parseInt(event.srcElement.innerText);
    const numberOfMoves = selectedPage - this.pages[this.pointer].value;
    if (numberOfMoves > 0) {
      for (let i = 1; i <= Math.abs(numberOfMoves); i++) {
        this.move(true);
      }
    } else {
      for (let i = 1; i <= Math.abs(numberOfMoves); i++) {
        this.move(false);
      }
    }
  }

  makePages() {
    const pages = [];
    for (let i = 0; i <= 4; i++) {
      const page = { page: document.createElement("p"), value: undefined };
      pages.push(page);
    }
    return pages;
  }

  pageNumbers(rightEnd) {
    if (rightEnd <= 4) {
      for (let i = 0; i <= rightEnd; i++) {
        this.pages[i].value = i;
      }
      return;
    }
    for (let i = 0; i <= 4; i++) {
      this.pages[i].value = rightEnd - (5 - (i + 1));
    }
  }

  //loads the value of the page into it's html component
  //and hilights the selected page
  drawPages() {
    let i = 0;
    this.clearHidden();
    for (const page of this.pages) {
      if (page.value === undefined) {
        page.page.classList.add("hide");
        continue;
      }
      page.page.innerText = page.value;
      if (i === this.pointer) {
        this.clearSelected();
        page.page.classList.add("selected-page");
      }
      i++;
    }
  }

  //clears selected class from all page components
  clearSelected() {
    for (const page of this.pages) {
      page.page.classList.remove("selected-page");
    }
  }

  clearHidden() {
    for (const page of this.pages) {
      page.page.classList.remove("hide");
    }
  }

  //moves to right end
  end() {
    if (this.maxPages < 5) {
      this.pointer = this.maxPages;
    } else {
      this.pointer = 4;
    }
    this.pageNumbers(this.maxPages);
    this.drawPages();
    document.dispatchEvent(this.moved);
  }

  //moves to left end
  begin() {
    this.pointer = 0;
    if (this.maxPages < 5) {
      this.pageNumbers(this.maxPages);
    } else {
      this.pageNumbers(4);
    }
    this.drawPages();
    document.dispatchEvent(this.moved);
    return;
  }

  //moves page up or down depending on direction passed
  move(forwards) {
    const pointerMax = (this.maxPages <= 4) ? this.maxPages : 4;
    const rightEnd = this.pages[4].value === this.maxPages;
    const leftEnd = this.pages[0].value === 0;

    if (forwards) {
      if (this.pointer === pointerMax) {
        return;
      }

      if (this.maxPages <= 4) {
        this.pointer++;
        return;
      }

      if (this.pointer != 2 || rightEnd) {
        this.pointer++;
        return;
      }

      for (const page of this.pages) {
        page.value++;
      }
      return;

      //backwards
    } else {
      if (this.pointer == 0) {
        return;
      }

      if (this.maxPages <= 4) {
        this.pointer--;
        return;
      }

      if (this.pointer != 2 || leftEnd) {
        this.pointer--;
        return;
      }

      for (const page of this.pages) {
        page.value--;
      }
    }
  }
}
