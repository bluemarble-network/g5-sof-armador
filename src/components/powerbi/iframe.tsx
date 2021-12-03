import { Box } from '@material-ui/system'
import Image from 'next/image'
import { models, Report } from 'powerbi-client'
import { PowerBIEmbed } from 'powerbi-client-react'
import { useState } from 'react'

export default function Iframe({ props, preloader, page, filters }) {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: '#fff'
          }}
        >
          <Image src={preloader} alt='Preloader' width={400} height={400} />
        </Box>
      )}

      <PowerBIEmbed
        embedConfig={{
          type: 'report', // Supported types: report, dashboard, tile, visual and qna
          pageName: 'Carregamento',
          id: props.id_relatorio,
          // embedUrl: '<Embed Url>',
          accessToken: props.token,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: false
              },
              pageNavigation: { visible: false }
            }
          },
          filters
        }}
        eventHandlers={
          new Map([
            [
              'loaded',
              function () {
                const win: any = window
                win.report.getPages().then((el) => {
                  el[page].setActive()
                })
                console.log('Report loaded')
              }
            ],
            [
              'rendered',
              function () {
                setLoading(false)
              }
            ],
            [
              'error',
              function (event) {
                console.log(event?.detail)
              }
            ]
          ])
        }
        cssClassName={'report-style-class'}
        getEmbeddedComponent={(embeddedReport) => {
          const win: any = window
          win.report = embeddedReport as Report
        }}
      />
    </>
  )
}
