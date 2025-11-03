// // // import React, { useState } from "react";
// // // import { Outlet } from "react-router-dom";
// // // import Header from "./Header";
// // // import SidebarMenu from "./SidebarMenu";

// // // import styles from "../styles/SidebarLayout.module.css";

// // // interface SidebarLayoutProps {
// // //   onLogout: () => void;
// // // }

// // // const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
// // //   const [sidebarWidth, setSidebarWidth] = useState(240);

// // //   return (
// // //     <div className={styles.appShell}>
// // //       <Header onLogout={onLogout} />

// // //       <aside
// // //         className={styles.sidebarWrapper}
// // //         style={{ width: sidebarWidth }}
// // //       >
// // //         <SidebarMenu setSidebarWidth={setSidebarWidth} />
// // //       </aside>

// // //       <div
// // //         className={styles.backdropSpacer}
// // //         style={{ width: sidebarWidth }}
// // //       />

// // //       <main className={styles.mainArea}>
// // //         <section className={styles.contentSurface}>
// // //           <Outlet />
// // //         </section>
// // //       </main>
// // //     </div>
// // //   );
// // // };

// // // export default SidebarLayout;

// // import React, { useState } from "react";
// // import { Outlet } from "react-router-dom";
// // import Header from "./Header";
// // import SidebarMenu from "./SidebarMenu";

// // import styles from "../styles/SidebarLayout.module.css";

// // interface SidebarLayoutProps {
// //   onLogout: () => void;
// // }

// // const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
// //   const [sidebarWidth, setSidebarWidth] = useState(280);

// //   return (
// //     <div className={styles.appShell}>
// //       <Header onLogout={onLogout} />

// //       <aside
// //         className={styles.sidebarWrapper}
// //         style={{ width: sidebarWidth }}
// //       >
// //         <SidebarMenu setSidebarWidth={setSidebarWidth} />
// //       </aside>

// //       <div
// //         className={styles.backdropSpacer}
// //         style={{ width: sidebarWidth }}
// //       />

// //       <main className={styles.mainArea}>
// //         <section className={styles.contentSurface}>
// //           <Outlet />
// //         </section>
// //       </main>
// //     </div>
// //   );
// // };

// // export default SidebarLayout;

// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Header from "./Header";
// import SidebarMenu from "./SidebarMenu";

// import styles from "../styles/SidebarLayout.module.css";

// interface SidebarLayoutProps {
//   onLogout: () => void;
// }

// const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
//   const [sidebarWidth, setSidebarWidth] = useState(280);

//   return (
//     <div className={styles.appShell}>
//       <Header onLogout={onLogout} />

//       <aside
//         className={styles.sidebarWrapper}
//         style={{ width: sidebarWidth }}
//       >
//         <SidebarMenu setSidebarWidth={setSidebarWidth} />
//       </aside>

//       <div
//         className={styles.backdropSpacer}
//         style={{ width: sidebarWidth }}
//       />

//       <main className={styles.mainArea}>
//         <section className={styles.contentSurface}>
//           <Outlet />
//         </section>
//       </main>
//     </div>
//   );
// };

// export default SidebarLayout;

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";

import styles from "./SidebarLayout.module.css";

interface SidebarLayoutProps {
  onLogout: () => void;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ onLogout }) => {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  return (
    <div className={styles.appShell}>
      <aside
        className={styles.sidebarWrapper}
        style={{ width: sidebarWidth }}
      >
        <SidebarMenu setSidebarWidth={setSidebarWidth} onLogout={onLogout} />
      </aside>

      <div
        className={styles.backdropSpacer}
        style={{ width: sidebarWidth }}
      />

      <main className={styles.mainArea}>
        <section className={styles.contentSurface}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default SidebarLayout;