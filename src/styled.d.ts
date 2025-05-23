// import original module declarations
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    textColor: string;
    subTextColor: string;
    backgroundColor: string;
    btnColor: string;
    hoverBtnColor: string;
    formContainerColor: string;
    navBackgroundColor:string;
    highlightColor:string;
  }
}
