import React from 'react';

interface IProps {}

function LocalLogin(props: LocalLoginProps): JSX.Element {
  return <div>LocalLogin component works!</div>;
}

export default LocalLogin;

export type LocalLoginProps = React.PropsWithChildren<IProps>;
