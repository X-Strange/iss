from apiclient.discovery import build


def main():

  # Build a service object for interacting with the API. Visit
  # the Google APIs Console <http://code.google.com/apis/console>
  # to get an API key for your own application.
  service = build('translate', 'v2',
            developerKey='AIzaSyCAwgxDEbgPxUD2KY63gLYC87K9SSpuWZQ')
  print service.translations().list(
      source='en',
      target='fr',
      q=['flower', 'car']
    ).execute()

if __name__ == '__main__':
  main()

