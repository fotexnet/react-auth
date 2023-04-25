import React from 'react';

interface IProps {}

function FacebookLogin(props: FacebookLoginProps): JSX.Element {
  return <div>FacebookLogin component works!</div>;
}

export default FacebookLogin;

export type FacebookLoginProps = React.PropsWithChildren<IProps>;
