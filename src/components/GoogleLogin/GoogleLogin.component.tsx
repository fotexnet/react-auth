import React from 'react';

interface IProps {}

function GoogleLogin(props: GoogleLoginProps): JSX.Element {
  return <div>GoogleLogin component works!</div>;
}

export default GoogleLogin;

export type GoogleLoginProps = React.PropsWithChildren<IProps>;
