import React from 'react';
import CustomError from '../components/Error';
import { NextComponentType, NextPageContext } from 'next';

interface ErrorProps {
  Component: NextComponentType<NextPageContext, any, any>;
  pageProps: any;
  statusCode: number;
  err: boolean;
}

class Error extends React.Component<ErrorProps> {
  static async getInitialProps({ Component, ctx }: { Component: NextComponentType<NextPageContext, any, any>, ctx: NextPageContext }) {
    let pageProps = {}

    if (Component?.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    const { res, err } = ctx
    const isErr = err ? true : false;

    return { pageProps, statusCode: res ? res.statusCode : err ? err.statusCode : 404, err: isErr }
  }

  render() {
    const { Component, pageProps, statusCode, err } = this.props;

    if (statusCode === 404) {
      return <CustomError statusCode={404} statusMessage={'Page could not be found'} />;
    }
    if (statusCode === 500) {
      return <CustomError statusCode={500} statusMessage={'Internal server error'} />;
    }
    else if (err) {
      return <CustomError statusCode={statusCode} statusMessage={'Something went wrong'} />;
    }

    return <Component {...pageProps} />;
  }
}

export default Error;
